import { Answer, ProfileType, Profile, Language, Badge, QuestionType } from '../types';
import { SURVEY_DATA } from '../constants';

const API_BASE_URL = (import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== null) 
  ? import.meta.env.VITE_API_URL 
  : ''; // Empty string for relative API URL

export class ProfileService {
  private static loadPromise: Promise<any> | null = null;
  
  static getProfiles(): Profile[] {
    const saved = localStorage.getItem('neuroprofile_profiles');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.map(this.migrateLocalProfile.bind(this)) : [];
    } catch {
      return [];
    }
  }

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
        credentials: 'include',
        body: JSON.stringify({
          test_type: testType,
          answers: profile.answers[testType] || {},
          time_spent: profile.timeSpent ? (profile.timeSpent[testType] || 0) : 0,
          scores: scores,
          lang: lang,
          tone: profile.tone || 'professional',
          source: localStorage.getItem('lead_source') || undefined,
          referred_by: localStorage.getItem('referred_by') || undefined
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error('[ProfileService] Save error payload:', result);
        return { status: 'error', detail: result.detail };
      }
      this.loadPromise = null; // Invalidate cache on save
      console.log('[ProfileService] Save result response:', result);
      return result;
    } catch (e) {
      console.error('[ProfileService] Failed to save to backend', e);
      return null;
    }
  }

  static async streamAnalysisFromBackend(profile: Profile, testType: string, scores: any, lang: Language, onChunk: (text: string) => void, forceRegenerate = false) {
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
        credentials: 'include',
        body: JSON.stringify({
          test_type: testType,
          answers: profile.answers[testType] || {},
          scores: scores,
          lang: lang,
          tone: profile.tone || 'professional',
          force_regenerate: forceRegenerate
        }),
      });

      if (!response.ok) {
        let errorMsg = `Error getting recommendations: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.message) errorMsg = errData.message;
        } catch { /* skip */ }
        throw new Error(errorMsg);
      }

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
      throw e;
    }
  }

  static async loadResultFromBackend() {
    const authDataString = localStorage.getItem('auth_token');
    if (!authDataString) return null;

    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        console.log('[ProfileService] Loading result for current session...');
        const response = await fetch(`${API_BASE_URL}/api/me/result`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
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

        console.log('[ProfileService] No result found (or other error) for current session.', response.status);
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
      let url = `${API_BASE_URL}/api/results`;
      if (q) {
        url += `?q=${encodeURIComponent(q)}`;
      }

      const response = await fetch(url, { credentials: 'include' });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (e) {
      console.error('Failed to fetch admin results', e);
      return [];
    }
  }

  // --- Badge Management ---

  static async fetchBadges(includeInactive = false): Promise<Badge[]> {
    try {
      const url = `${API_BASE_URL}/api/badges?include_inactive=${includeInactive}`;
      const response = await fetch(url);
      if (response.ok) return await response.json();
      return [];
    } catch (e) {
      console.error('Failed to fetch badges', e);
      return [];
    }
  }

  static async createBadge(badge: Partial<Badge>) {
    const authDataString = localStorage.getItem('auth_token');
    if (!authDataString) return null;
    const authData = JSON.parse(authDataString);
    const user = authData.user || authData;

    try {
      const response = await fetch(`${API_BASE_URL}/api/badges?user_id=${user.id}&hash=${user.hash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(badge),
      });
      return await response.json();
    } catch (e) {
      console.error('Failed to create badge', e);
      return null;
    }
  }

  static async updateBadge(badgeId: number, badge: Partial<Badge>) {
    const authDataString = localStorage.getItem('auth_token');
    if (!authDataString) return null;
    const authData = JSON.parse(authDataString);
    const user = authData.user || authData;

    try {
      const response = await fetch(`${API_BASE_URL}/api/badges/${badgeId}?user_id=${user.id}&hash=${user.hash}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(badge),
      });
      return await response.json();
    } catch (e) {
      console.error('Failed to update badge', e);
      return null;
    }
  }

  static async deleteBadge(badgeId: number) {
    const authDataString = localStorage.getItem('auth_token');
    if (!authDataString) return null;
    const authData = JSON.parse(authDataString);
    const user = authData.user || authData;

    try {
      const response = await fetch(`${API_BASE_URL}/api/badges/${badgeId}?user_id=${user.id}&hash=${user.hash}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (e) {
      console.error('Failed to delete badge', e);
      return null;
    }
  }

  static async assignBadge(targetUserId: string, badgeId: number) {
    const authDataString = localStorage.getItem('auth_token');
    if (!authDataString) return null;
    const authData = JSON.parse(authDataString);
    const user = authData.user || authData;

    try {
      const response = await fetch(`${API_BASE_URL}/api/user-badges?user_id=${user.id}&hash=${user.hash}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: targetUserId, badge_id: badgeId }),
      });
      return await response.json();
    } catch (e) {
      console.error('Failed to assign badge', e);
      return null;
    }
  }

  static async removeBadge(targetUserId: string, badgeId: number) {
    const authDataString = localStorage.getItem('auth_token');
    if (!authDataString) return null;
    const authData = JSON.parse(authDataString);
    const user = authData.user || authData;

    try {
      const response = await fetch(`${API_BASE_URL}/api/user-badges/${targetUserId}/${badgeId}?user_id=${user.id}&hash=${user.hash}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (e) {
      console.error('Failed to remove badge', e);
      return null;
    }
  }

  // --- Feature Flags ---

  static async fetchFeatureFlags(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feature-flags`);
      if (response.ok) return await response.json();
      return [];
    } catch (e) {
      console.error('Failed to fetch feature flags', e);
      return [];
    }
  }

  static async updateFeatureFlag(code: string, isEnabled: boolean) {
    const authDataString = localStorage.getItem('auth_token');
    if (!authDataString) return null;
    const authData = JSON.parse(authDataString);
    const user = authData.user || authData;

    try {
      const response = await fetch(`${API_BASE_URL}/api/feature-flags/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, hash: user.hash, is_enabled: isEnabled }),
      });
      return await response.json();
    } catch (e) {
      console.error('Failed to toggle feature flag', e);
      return null;
    }
  }

  static calculateCategoryScore(answers: Record<string, Answer>, criteria: string): number | null {
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

    if (targetQuestions.length === 0) return null;

    let total = 0;
    let count = 0;
    
    targetQuestions.forEach(q => {
      const ans = answers[q.id];
      if (!ans || q.type === QuestionType.DRAWING) return;

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

    return count > 0 ? Number((total / count).toFixed(1)) : null;
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

  static async trackInteraction(promptId: string, action: 'click' | 'copy' | 'navigate', testType: string = 'full_aphantasia_profile') {
    // Session is handled via HttpOnly cookies
    try {
      await fetch(`${API_BASE_URL}/api/track-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          prompt_id: promptId,
          action,
          test_type: testType,
        }),
      });
    } catch (e) {
      console.warn('[ProfileService] Failed to track interaction', e);
    }
  }
}
