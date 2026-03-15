import { Answer, ProfileType, Profile, Language } from '../types';
import { SURVEY_DATA } from '../constants';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ProfileService {
  private static loadPromise: Promise<any> | null = null;

  private static migrateLocalProfile(p: any): Profile {
    // If answers is already keyed (nested objects)
    const firstVal = Object.values(p.answers || {})[0];
    if (firstVal && typeof firstVal === 'object' && !('questionId' in firstVal)) {
      return p as Profile;
    }

    // Migration: transform flat answers to keyed answers
    const flatAnswers = (p.answers || {}) as Record<string, Answer>;
    const keyedAnswers: Record<string, Record<string, Answer>> = {};

    Object.entries(flatAnswers).forEach(([qId, ans]) => {
      let surveyId = p.surveyId || 'full_aphantasia_profile';
      if (qId.startsWith('demo_')) surveyId = 'express_demo';
      
      if (!keyedAnswers[surveyId]) keyedAnswers[surveyId] = {};
      keyedAnswers[surveyId][qId] = ans;
    });

    return {
      ...p,
      answers: keyedAnswers
    };
  }

  static async saveResultToBackend(profile: Profile, testType: string, scores: any, lang: Language) {
    const authDataString = localStorage.getItem('auth_token');
    if (!authDataString) {
      console.warn('[ProfileService] No auth_token found in localStorage');
      return null;
    }

    try {
      const authData = JSON.parse(authDataString);
      const user = authData.user || authData;

      if (!user || !user.id || user.error) {
        console.error('[ProfileService] Invalid user data', user);
        return null;
      }

      console.log('[ProfileService] Saving result to backend...', { testType, userId: user.id });

      const response = await fetch(`${API_BASE_URL}/api/save-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_data: user,
          test_type: testType,
          answers: profile.answers[testType] || {},
          scores: scores,
          lang: lang
        }),
      });

      const result = await response.json();
      this.loadPromise = null; // Invalidate cache on save
      console.log('[ProfileService] Save result response:', result);
      return result;
    } catch (e) {
      console.error('[ProfileService] Failed to save to backend', e);
      return null;
    }
  }

  static async streamAnalysisFromBackend(profile: Profile, testType: string, scores: any, lang: Language, onChunk: (text: string) => void) {
    const authDataString = localStorage.getItem('auth_token');
    if (!authDataString) return null;

    try {
      const authData = JSON.parse(authDataString);
      const user = authData.user || authData;

      if (!user || !user.id || user.error) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/analyze-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_data: user,
          test_type: testType,
          answers: profile.answers[testType] || {},
          scores: scores,
          lang: lang
        }),
      });

      if (!response.body) return null;

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
      }
      return true;
    } catch (e) {
      console.error('[ProfileService] Failed to stream from backend', e);
      return null;
    }
  }

  static async loadResultFromBackend() {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      const authDataString = localStorage.getItem('auth_token');
      if (!authDataString) {
        this.loadPromise = null;
        return null;
      }

      try {
        const authData = JSON.parse(authDataString);
        const user = authData.user || authData;

        if (!user || !user.id || user.error) {
          if (user?.error) {
            console.warn('[ProfileService] Auth contains error:', user.error);
          }
          this.loadPromise = null;
          return null;
        }

        console.log('[ProfileService] Loading result for user:', user.id);
        const response = await fetch(`${API_BASE_URL}/api/me/result`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });

        if (response.status === 401) {
          console.warn('[ProfileService] 401 Unauthorized. Clearing invalid session.');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('telegram_auth');
          globalThis.dispatchEvent(new CustomEvent('auth-logout'));
          this.loadPromise = null;
          return null;
        }

        if (response.ok) {
          const data = await response.json();
          console.log('[ProfileService] Loaded result:', data ? 'Success' : 'None');
          return data;
        }

        console.error('[ProfileService] Load result failed:', response.status, response.statusText);
        this.loadPromise = null;
        return null;
      } catch (e) {
        console.error('[ProfileService] Failed to load from backend', e);
        this.loadPromise = null;
        return null;
      }
    })();

    return this.loadPromise;
  }

  static async fetchAllResults(q?: string) {
    const authDataString = localStorage.getItem('auth_token');
    if (!authDataString) return [];

    try {
      const authData = JSON.parse(authDataString);
      const user = authData.user || authData;

      let url = `${API_BASE_URL}/api/results?user_id=${user.id}&hash=${user.hash}`;
      if (q) {
        url += `&q=${encodeURIComponent(q)}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (e) {
      console.error('Failed to fetch admin results', e);
      return [];
    }
  }

  static calculateCategoryScore(answers: Record<string, Answer>, criteria: string): number {
    const allCategories = SURVEY_DATA;
    const allQuestions = allCategories.flatMap(c => c.questions);

    // Find questions by:
    // a) Subcategory match
    // b) Question category ID match
    // c) Parent Category ID or Title match
    const targetQuestions = allQuestions.filter(q => {
      if (q.subCategory?.en === criteria) return true;
      if (q.category === criteria) return true;
      
      const parent = allCategories.find(c => c.questions.some(innerQ => innerQ.id === q.id));
      if (parent && (parent.id === criteria || parent.title.en === criteria)) return true;
      
      return false;
    });

    if (targetQuestions.length === 0) return 0;

    let total = 0;
    let count = 0;
    
    targetQuestions.forEach(q => {
      const ans = answers[q.id];
      if (!ans) return;

      if (typeof ans.value === 'number') {
        total += ans.value;
        count++;
      } else if (typeof ans.value === 'string' && ans.value.length > 0) {
        // Simple mapping for CHOICE/TEXT values to score 1-5 for better radar visibility
        const v = ans.value.toLowerCase();
        
        // High vividness/propensity patterns
        const high = ['yes', 'instant', 'movie', 'vivid', 'constantly', '3d', 'emotional', 'always', 'map', 'often', 'visual_dreams', 'visual_rotate'];
        // Medium/Partial patterns
        const med = ['partial', 'gradual', 'sometimes', 'frames', 'mixed', 'abstract', 'maybe', 'effort', 'schematic', 'logic', 'sequence'];
        // Low/None patterns
        const low = ['no', 'facts', 'never', 'none', 'rules', 'impossible', 'hardly', 'non_visual_dreams', 'no_recall', 'analytical', 'fact'];
        
        if (high.some(k => v.includes(k))) {
          total += 5;
          count++;
        } else if (low.some(k => v.includes(k))) {
          total += 1;
          count++;
        } else if (med.some(k => v.includes(k))) {
          total += 3;
          count++;
        }
      }
    });

    return count > 0 ? Number((total / count).toFixed(1)) : 0;
  }

  static getProfileTypeLabel(type: ProfileType | undefined, lang: Language): string {
    if (!type) return '';
    const labels: Record<ProfileType, Record<Language, string>> = {
      [ProfileType.APHANTASIA]: { uk: 'Афантазія', en: 'Aphantasia', ru: 'Афантазия' },
      [ProfileType.HYPOPHANTASIA]: { uk: 'Гіпофантазія', en: 'Hypophantasia', ru: 'Гипофантазия' },
      [ProfileType.PHANTASIA]: { uk: 'Фантазія', en: 'Phantasia', ru: 'Фантазия' },
      [ProfileType.HYPERPHANTASIA]: { uk: 'Гіперфантазія', en: 'Hyperphantasia', ru: 'Гиперфантазия' },
    };
    return labels[type as ProfileType]?.[lang] || '';
  }

  static getProfileType(visualScore: number): ProfileType {
    if (visualScore <= 1.5) return ProfileType.APHANTASIA;
    if (visualScore <= 3) return ProfileType.HYPOPHANTASIA;
    if (visualScore >= 4.5) return ProfileType.HYPERPHANTASIA;
    return ProfileType.PHANTASIA;
  }

  static getProfiles(): Profile[] {
    const saved = localStorage.getItem('neuroprofile_profiles');
    if (!saved) return [];
    try {
      const data = JSON.parse(saved);
      if (Array.isArray(data)) {
        return data.map(p => this.migrateLocalProfile(p));
      }
      return [];
    } catch (e) {
      console.error('Failed to parse profiles', e);
      return [];
    }
  }

  static saveProfiles(profiles: Profile[]): void {
    localStorage.setItem('neuroprofile_profiles', JSON.stringify(profiles));
  }

  static createProfile(name: string, surveyId: string, customId?: string): Profile {
    const profiles = this.getProfiles();

    // If customId provided, check if it already exists to avoid duplicates
    if (customId) {
      const existing = profiles.find(p => p.id === customId);
      if (existing) return existing;
    }

    const newProfile: Profile = {
      id: customId || 'profile_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now().toString(36),
      name,
      answers: { [surveyId]: {} },
      lastUpdated: new Date().toISOString(),
      surveyId,
    };

    profiles.push(newProfile);
    this.saveProfiles(profiles);
    return newProfile;
  }

  static updateProfile(profileId: string, surveyId: string, answers: Record<string, Answer>, type?: ProfileType): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === profileId);
    if (index !== -1) {
      if (!profiles[index].answers) profiles[index].answers = {};
      profiles[index].answers[surveyId] = answers;
      profiles[index].lastUpdated = new Date().toISOString();
      if (type) profiles[index].type = type;
      this.saveProfiles(profiles);
    }
  }

  static renameProfile(profileId: string, newName: string): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === profileId);
    if (index !== -1) {
      profiles[index].name = newName;
      profiles[index].lastUpdated = new Date().toISOString();
      this.saveProfiles(profiles);
    }
  }

  static deleteProfile(profileId: string): void {
    const profiles = this.getProfiles().filter(p => p.id !== profileId);
    this.saveProfiles(profiles);
  }

  static updateProfileSurveyId(profileId: string, surveyId: string): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === profileId);
    if (index !== -1) {
      profiles[index].surveyId = surveyId;
      profiles[index].lastUpdated = new Date().toISOString();
      this.saveProfiles(profiles);
    }
  }
}
