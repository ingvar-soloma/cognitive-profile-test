import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Answer, LocalizedCategoryData, Language, SurveyDefinition, LocalizedScaleConfig, Profile, QuestionType } from './types';
import { SurveyService } from './services/SurveyService';
import { Results } from '@/components/Results/Results';
import { Header } from './components/Header';
import { Intro } from './components/Home/Intro';
import { Survey } from './components/Survey/Survey';
import { ProfileManager } from './components/Home/ProfileManager';
import { ImportManager } from './components/Home/ImportManager';
import { UI_TRANSLATIONS } from './translations';
import { AVAILABLE_SURVEYS } from './constants';
import { ProfileService } from './services/ProfileService';
// @ts-ignore - Assuming the package is available via importmap
import { decode } from '@toon-format/toon';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginModal } from './components/Auth/LoginModal';
import { Recommendations } from './components/Recommendations/Recommendations';
import { DashboardResults } from './components/Results/DashboardResults';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams, useSearchParams } from 'react-router-dom';

export enum AppState {
  INTRO = 'INTRO',
  SURVEY = 'SURVEY',
  RESULTS = 'RESULTS',
  RECOMMENDATIONS = 'RECOMMENDATIONS',
  DASHBOARD_RESULTS = 'DASHBOARD_RESULTS',
}

const LOCAL_STORAGE_KEY = 'neuroprofile_survey_state';

type Theme = 'light' | 'dark';

interface User {
  id: string | number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [appState, setAppState] = useState<AppState>(() => {
    const path = window.location.pathname;
    if (path === '/results') return AppState.DASHBOARD_RESULTS;
    if (path.startsWith('/results/')) return AppState.RESULTS;
    if (path === '/dashboard') return AppState.DASHBOARD_RESULTS;
    if (path.startsWith('/survey/')) return AppState.SURVEY;
    return AppState.INTRO;
  });

  // Sync state with URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setAppState(AppState.INTRO);
    else if (path === '/results') setAppState(AppState.DASHBOARD_RESULTS);
    else if (path.startsWith('/results/')) setAppState(AppState.RESULTS);
    else if (path === '/recommendations') setAppState(AppState.RECOMMENDATIONS);
    else if (path === '/history' || path === '/dashboard') setAppState(AppState.DASHBOARD_RESULTS);
    else if (path.startsWith('/survey/')) setAppState(AppState.SURVEY);
  }, [location.pathname]);

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof navigator === 'undefined') return 'uk';
    const lang = navigator.language.toLowerCase();
    if (lang.includes('ru')) return 'ru';
    if (lang.includes('en')) return 'en';
    return 'uk';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('neuroprofile_theme') as Theme;
    if (saved && (saved === 'light' || saved === 'dark')) return saved;
    if (globalThis.window !== undefined && globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [activeSurveyId, setActiveSurveyId] = useState<string>('full_aphantasia_profile'); // ID за замовчуванням
  const [currentSurvey, setCurrentSurvey] = useState<SurveyDefinition | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [profiles, setProfiles] = useState<Profile[]>(() => ProfileService.getProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    const loadedProfiles = ProfileService.getProfiles();
    const storedProfileId = localStorage.getItem('neuroprofile_active_profile_id');
    if (storedProfileId && loadedProfiles.some(p => p.id === storedProfileId)) {
      return storedProfileId;
    } else if (loadedProfiles.length > 0) {
      return loadedProfiles[0].id;
    }
    return null;
  });
  const [backendRecommendations, setBackendRecommendations] = useState<Record<string, string>>({});
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginModalConfig, setLoginModalConfig] = useState<{ title?: string, description?: string }>({});

  // Sync activeSurveyId from URL if in survey mode
  useEffect(() => {
    if (location.pathname.startsWith('/survey/')) {
      const idStr = location.pathname.split('/survey/')[1];
      if (idStr && idStr !== activeSurveyId) {
        setActiveSurveyId(idStr);
      }
    }
  }, [location.pathname, activeSurveyId]);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_token') || localStorage.getItem('telegram_auth');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const userData = data.user || data;
        if (userData && userData.id && userData.hash && !userData.error) {
          return userData;
        }
        console.warn('[App] Invalid auth in localStorage found and cleared');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('telegram_auth');
        return null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const isAdmin = useMemo(() => {
    if (!user) return false;
    const adminIds = (import.meta.env.VITE_ADMIN_USER_IDS || import.meta.env.VITE_ADMIN_TELEGRAM_IDS || '').split(',');
    return adminIds.includes(String(user.id));
  }, [user]);

  const [importingAnswers, setImportingAnswers] = useState<Record<string, Answer> | null>(null);
  const [hasExistingResults, setHasExistingResults] = useState<boolean>(false);

  const initialLoadRef = useRef(false);

  // Initialize
  useEffect(() => {
    let storedUserId = localStorage.getItem('neuroprofile_user_id');
    if (!storedUserId) {
      storedUserId = 'user_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem('neuroprofile_user_id', storedUserId);
    }

    // Initial profiles state already set in constructor/useState

    // Show login modal on entry if not authenticated
    const savedAuth = localStorage.getItem('auth_token');
    if (!savedAuth) {
      setTimeout(() => setShowLoginModal(true), 1500);
    }

    // Login Listener
    const handleLogin = (e: any) => {
      const userData = e.detail;
      if (userData && userData.id && !userData.error) {
        console.log('[App] Login event received:', userData.first_name);
        setUser(userData);
        setShowLoginModal(false);
      } else {
        console.warn('[App] Invalid login event ignored:', userData);
      }
    };
    globalThis.addEventListener('auth-login', handleLogin);
    globalThis.addEventListener('telegram-login', handleLogin); // Keep for compatibility if components use it

    return () => {
      globalThis.removeEventListener('auth-login', handleLogin);
      globalThis.removeEventListener('telegram-login', handleLogin);
    };
  }, []);

  // Sync profiles with User
  useEffect(() => {
    if (user) {
      // If logged in, we only care about the profile for this user
      const userProfileId = `g_${user.id}`;

      // Use latest profiles from service to avoid stale state issues
      const currentProfiles = ProfileService.getProfiles();
      let profile = currentProfiles.find(p => p.id === userProfileId);

      if (profile) {
        // Even if profile exists, ensure state is synced
        setProfiles(currentProfiles);
      } else {
        const name = `${user.first_name} ${user.last_name || ''}`.trim();
        ProfileService.createProfile(name, activeSurveyId, userProfileId);
        setProfiles(ProfileService.getProfiles());
      }

      if (activeProfileId !== userProfileId) {
        setActiveProfileId(userProfileId);
      }

      // Check if user already has results on backend
      if (!initialLoadRef.current) {
        initialLoadRef.current = true;
        ProfileService.loadResultFromBackend().then(result => {
          if (result && result.answers) {
            setAnswers(result.answers);
            setHasExistingResults(true);

            if (result.gemini_recommendations) {
              setBackendRecommendations(
                typeof result.gemini_recommendations === 'string'
                  ? { [result.test_type || 'unknown']: result.gemini_recommendations }
                  : result.gemini_recommendations
              );
            }
          } else {
            setHasExistingResults(false);
          }
        }).catch(err => {
          console.error('[App] Failed to load results:', err);
          initialLoadRef.current = false;
        });
      }
    } else {
      setHasExistingResults(false);
      setBackendRecommendations({});
      initialLoadRef.current = false;
    }
  }, [user]); // Removed activeSurveyId from deps to avoid multiple loads when it changes

  // One-time cleanup: Deduplicate profiles by ID if they somehow got duplicated
  useEffect(() => {
    const currentProfiles = ProfileService.getProfiles();
    const uniqueProfilesMap = new Map();
    let hasDuplicates = false;

    currentProfiles.forEach(p => {
      if (uniqueProfilesMap.has(p.id)) {
        hasDuplicates = true;
      } else {
        uniqueProfilesMap.set(p.id, p);
      }
    });

    if (hasDuplicates) {
      const uniqueProfiles = Array.from(uniqueProfilesMap.values());
      ProfileService.saveProfiles(uniqueProfiles);
      setProfiles(uniqueProfiles);
    }
  }, []);

  // Fetch Survey Data (Simulation of DB call)
  useEffect(() => {
    // Only fetch if we are starting the survey or if we need to preload data
    // For now, we fetch when activeSurveyId changes, but we don't block UI unless we are entering SURVEY mode
    SurveyService.getSurveyById(activeSurveyId)
      .then((data) => {
        if (data) {
          setCurrentSurvey(data);
        }
      });
  }, [activeSurveyId]);

  const handleStartSurvey = (surveyId?: string) => {
    if (!user) {
      setLoginModalConfig({});
      setShowLoginModal(true);
      return;
    }

    setIsLoading(true);
    const surveyIdToStart = surveyId || activeSurveyId;

    // If starting a DIFFERENT survey on the same profile, update the profile's primary survey ID
    if (activeProfileId && surveyIdToStart) {
      const profile = profiles.find(p => p.id === activeProfileId);
      if (profile && profile.surveyId !== surveyIdToStart) {
        ProfileService.updateProfileSurveyId(activeProfileId, surveyIdToStart);
        setProfiles(ProfileService.getProfiles());
      }
    }

    SurveyService.getSurveyById(surveyIdToStart)
      .then((data) => {
        if (data) {
          setCurrentSurvey(data);
          navigate(`/survey/${surveyIdToStart}`);
        }
      })
      .finally(() => setIsLoading(false));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Theme Logic
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('neuroprofile_theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('telegram_auth');
    localStorage.removeItem('neuroprofile_active_profile_id');
    setUser(null);
    window.location.reload(); // Hard reload to clear all states and re-trigger initial modal
  };

  // Load answers from active profile
  useEffect(() => {
    if (activeProfileId) {
      const profile = profiles.find(p => p.id === activeProfileId);
      if (profile) {
        setAnswers(profile.answers);
        localStorage.setItem('neuroprofile_active_profile_id', activeProfileId);
      }
    }
  }, [activeProfileId]);

  useEffect(() => {
    // Save state whenever it changes
    if (activeProfileId && Object.keys(answers).length > 0) {
      ProfileService.updateProfile(activeProfileId, answers);
    }
  }, [answers, activeProfileId]);

  useEffect(() => {
    // Warn on exit if in survey
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (appState === AppState.SURVEY && Object.keys(answers).length > 0) {
        e.preventDefault();
      }
    };

    globalThis.addEventListener('beforeunload', handleBeforeUnload);
    return () => globalThis.removeEventListener('beforeunload', handleBeforeUnload);
  }, [appState, answers]);


  // Derive Localized Data
  const localizedCategories: LocalizedCategoryData[] = useMemo(() => {
    if (!currentSurvey) return [];

    const localizeQuestion = (q: any) => ({
      id: q.id,
      category: q.category,
      type: q.type,
      text: q.text[language],
      placeholder: q.placeholder ? q.placeholder[language] : undefined,
      subCategory: q.subCategory ? q.subCategory[language] : undefined,
      hint: q.hint ? q.hint[language] : undefined,
      options: q.options?.map((opt: any) => ({
        value: opt.value,
        label: opt.label[language]
      }))
    });

    const localizeCategory = (cat: any) => ({
      id: cat.id,
      title: cat.title[language],
      description: cat.description[language],
      questions: cat.questions.map(localizeQuestion)
    });

    return currentSurvey.categories.map(localizeCategory);
  }, [language, currentSurvey]);

  const localizedScaleConfig: LocalizedScaleConfig | undefined = useMemo(() => {
    if (!currentSurvey || !currentSurvey.scaleConfig) return undefined;

    const labels: Record<number, string> = {};
    Object.entries(currentSurvey.scaleConfig.labels).forEach(([key, val]) => {
      labels[Number(key)] = val[language];
    });

    return {
      min: currentSurvey.scaleConfig.min,
      max: currentSurvey.scaleConfig.max,
      labels
    };
  }, [language, currentSurvey]);

  const ui = UI_TRANSLATIONS[language];
  const activeCategory = localizedCategories[currentCategoryIndex];

  // Progress Calculation
  const activeProfile = useMemo(() => profiles.find(p => p.id === activeProfileId), [profiles, activeProfileId]);

  const isQuestionAnswered = (q: any, ans: Answer | undefined) => {
    if (!ans) return false;
    if (q.type === QuestionType.SCALE) return typeof ans.value === 'number';
    if (q.type === QuestionType.CHOICE) return typeof ans.value === 'string' && ans.value !== '';
    if (q.type === QuestionType.TEXT) return typeof ans.note === 'string' && ans.note.trim() !== '';
    if (q.type === QuestionType.DRAWING) return typeof ans.value === 'string' && ans.value.startsWith('data:image/');
    return false;
  };

  const surveyProgress = useMemo(() => {
    const progress: Record<string, { answered: number; total: number; percent: number }> = {};
    if (!activeProfile) return progress;

    AVAILABLE_SURVEYS.forEach(survey => {
      const questions = survey.categories.flatMap(c => c.questions);
      const total = questions.length;
      const answered = questions.filter(q => isQuestionAnswered(q, activeProfile.answers[q.id])).length;
      progress[survey.id] = {
        answered,
        total,
        percent: total > 0 ? Math.round((answered / total) * 100) : 0
      };
    });

    return progress;
  }, [activeProfile, profiles]);

  const currentSurveyQuestions = useMemo(() => currentSurvey ? currentSurvey.categories.flatMap(c => c.questions) : [], [currentSurvey]);

  const totalQuestions = currentSurveyQuestions.length;
  const answeredCountInCurrentSurvey = useMemo(() => {
    return currentSurveyQuestions.filter(q => isQuestionAnswered(q, answers[q.id])).length;
  }, [currentSurveyQuestions, answers]);

  const progressPercent = totalQuestions > 0 ? Math.round((answeredCountInCurrentSurvey / totalQuestions) * 100) : 0;

  const handleAnswerChange = (questionId: string, value: string | number | null, note: string) => {
    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: { questionId, value, note },
      };

      // Update profile immediately
      if (activeProfileId) {
        ProfileService.updateProfile(activeProfileId, newAnswers);
        setProfiles(ProfileService.getProfiles());
      }

      return newAnswers;
    });
  };

  const handleCreateProfile = (name: string) => {
    const newProfile = ProfileService.createProfile(name, activeSurveyId);
    setProfiles(ProfileService.getProfiles());
    setActiveProfileId(newProfile.id);
  };

  const handleDeleteProfile = (id: string) => {
    ProfileService.deleteProfile(id);
    const updatedProfiles = ProfileService.getProfiles();
    setProfiles(updatedProfiles);
    if (activeProfileId === id) {
      setActiveProfileId(updatedProfiles.length > 0 ? updatedProfiles[0].id : null);
    }
  };

  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
  };

  const handleRenameProfile = (id: string, newName: string) => {
    ProfileService.renameProfile(id, newName);
    setProfiles(ProfileService.getProfiles());
  };

  const handleRetake = (profileId?: string) => {
    const targetProfile = profileId ? profiles.find(p => p.id === profileId) : activeProfile;
    if (targetProfile) {
      const baseName = targetProfile.name.split(' (Retake')[0];
      const retakes = profiles.filter(p => p.name.startsWith(baseName)).length;
      const newName = `${baseName} (Retake ${retakes})`;
      const newProfile = ProfileService.createProfile(newName, targetProfile.surveyId || activeSurveyId);
      setProfiles(ProfileService.getProfiles());
      setActiveProfileId(newProfile.id);
      setActiveSurveyId(targetProfile.surveyId || activeSurveyId);
      navigate('/');
    }
  };

  const handleNavigate = (state: AppState) => {
    switch (state) {
      case AppState.INTRO: navigate('/'); break;
      case AppState.RESULTS: navigate('/results'); break;
      case AppState.RECOMMENDATIONS: navigate('/recommendations'); break;
      case AppState.DASHBOARD_RESULTS: navigate('/results'); break;
      case AppState.SURVEY: navigate(`/survey/${activeSurveyId}`); break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextCategory = () => {
    // Require auth before moving to the second part (Category 1 -> Category 2)
    if (currentCategoryIndex === 0 && !user) {
      setLoginModalConfig({
        title: ui.loginRequired,
        description: ui.loginToContinue
      });
      setShowLoginModal(true);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentCategoryIndex < localizedCategories.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1);
    } else {
      if (activeProfileId) {
        ProfileService.updateProfile(activeProfileId, answers);
        setProfiles(ProfileService.getProfiles());
        navigate(`/results/${activeProfileId}`);
      } else {
        navigate('/results');
      }
    }
  };

  const handleApplyImport = (profileId: string | null, loadedAnswers: Record<string, Answer>) => {
    let targetId = profileId;

    if (!profileId) {
      // Create new profile
      const newProfile = ProfileService.createProfile(ui.importedProfile, activeSurveyId);
      targetId = newProfile.id;
    }

    if (targetId) {
      ProfileService.updateProfile(targetId, loadedAnswers);
      setProfiles(ProfileService.getProfiles());
      if (targetId === activeProfileId) {
        setAnswers(loadedAnswers);
      } else {
        setActiveProfileId(targetId);
        setAnswers(loadedAnswers);
      }
    }

    setImportingAnswers(null);
    setAppState(AppState.SURVEY);
    setCurrentCategoryIndex(0);
  };

  const prevCategory = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
    } else {
      setAppState(AppState.INTRO);
    }
  };

  const downloadProgress = () => {
    const profileName = activeProfile?.name || 'anonymous';
    const typeLabel = ProfileService.getProfileTypeLabel(activeProfile?.type, language) || 'unknown';
    const filename = `${profileName}_${typeLabel}_${activeSurveyId}_${new Date().toISOString().slice(0, 10)}.json`;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(answers, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (!content) return;

        let loadedAnswers = null;

        // Attempt to parse based on extension or content
        const isToon = file.name.endsWith('.toon');

        try {
          if (isToon) {
            loadedAnswers = decode(content);
          } else {
            // Try JSON
            const parsed = JSON.parse(content);
            // If the user uploaded a backend JSON export, extraction the answers part
            if (parsed && typeof parsed === 'object' && parsed.answers && typeof parsed.answers === 'object') {
              loadedAnswers = parsed.answers;
            } else {
              loadedAnswers = parsed;
            }
          }

          if (loadedAnswers && typeof loadedAnswers === 'object') {
            setImportingAnswers(loadedAnswers);
            // Clear input value to allow re-uploading the same file if needed
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        } catch (error) {
          console.error("Error parsing file", error);
          // Fallback: if JSON parse failed, maybe it was a TOON file named incorrectly or vice versa
          try {
            if (!isToon) {
              loadedAnswers = decode(content);
              if (loadedAnswers) {
                setImportingAnswers(loadedAnswers);
                return;
              }
            }
          } catch (e) {
            alert("Error reading file");
          }

        }
      };
      reader.readAsText(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleViewAdminResult = (result: any) => {
    if (result.answers) {
      setAnswers(result.answers);
      setAppState(AppState.RESULTS);
    }
  };

  return (
    <div className="min-h-screen bg-brand-paper text-brand-graphite pb-20 font-sans transition-colors duration-300">
      <Header
        appState={appState}
        ui={ui}
        language={language}
        theme={theme}
        progressPercent={progressPercent}
        activeProfileName={activeProfile?.name}
        user={user}
        onSetLanguage={setLanguage}
        onToggleTheme={toggleTheme}
        onDownloadProgress={downloadProgress}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main className={`${location.pathname === '/results' ? 'max-w-5xl' : 'max-w-3xl'} mx-auto p-4 md:p-8 transition-all duration-500`}>
        <Routes>
          <Route path="/" element={
            <>
              {(isAdmin) && (
                <AdminDashboard
                  ui={ui}
                  lang={language}
                  onViewResult={handleViewAdminResult}
                />
              )}

              {(!user || isAdmin) && (
                <ProfileManager
                  profiles={profiles}
                  activeProfileId={activeProfileId}
                  onSelect={handleSelectProfile}
                  onCreate={handleCreateProfile}
                  onDelete={handleDeleteProfile}
                  onRename={handleRenameProfile}
                  ui={ui}
                  lang={language}
                />
              )}
              <Intro
                ui={ui}
                language={language}
                activeSurveyId={activeSurveyId}
                onSetActiveSurveyId={setActiveSurveyId}
                onStartSurvey={handleStartSurvey}
                onTriggerFileUpload={triggerFileUpload}
                fileInputRef={fileInputRef}
                onFileUpload={handleFileUpload}
                isLoading={isLoading}
                surveyProgress={surveyProgress}
                hasExistingResults={hasExistingResults}
                backendRecommendations={backendRecommendations}
                onShowResults={(sid) => navigate(`/results/${activeProfileId}${sid ? `?surveyId=${sid}` : ''}`)}
              />
            </>
          } />

           <Route path="/results" element={
            <DashboardResults
              profiles={profiles}
              onViewResult={(id, sid) => {
                navigate(`/results/${id}${sid ? `?surveyId=${sid}` : ''}`);
              }}
              ui={ui}
              language={language}
            />
          } />

          <Route path="/results/:profileId" element={
            <ResultsWrapper
              profiles={profiles}
              onReset={(id) => handleRetake(id)}
              onGoHome={() => navigate('/')}
              ui={ui}
              lang={language}
              user={user}
              activeSurveyId={activeSurveyId}
              setActiveProfileId={setActiveProfileId}
              backendRecommendations={backendRecommendations}
            />
          } />

          <Route path="/history" element={<Navigate to="/results" replace />} />
          <Route path="/dashboard" element={<Navigate to="/results" replace />} />

          <Route path="/recommendations" element={
            <Recommendations
              ui={ui}
              isLocked={!profiles.some(p => Object.keys(p.answers).length > 0)}
              user={user}
            />
          } />

          <Route path="/survey/:surveyId" element={
            <Survey
              ui={ui}
              currentCategoryIndex={currentCategoryIndex}
              totalCategories={localizedCategories.length}
              activeCategory={activeCategory}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              onPrevCategory={prevCategory}
              onNextCategory={nextCategory}
              isLoading={isLoading}
              scaleConfig={localizedScaleConfig}
              isQuestionAnswered={isQuestionAnswered}
              showUnansweredIndicators={true}
              totalQuestions={totalQuestions}
              answeredCount={answeredCountInCurrentSurvey}
            />
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {importingAnswers && (
        <ImportManager
          profiles={profiles}
          newAnswers={importingAnswers}
          onImport={handleApplyImport}
          onCancel={() => setImportingAnswers(null)}
          ui={ui}
          lang={language}
        />
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        ui={ui}
        title={loginModalConfig.title}
        description={loginModalConfig.description}
      />
    </div>
  );
};


const ResultsWrapper: React.FC<any> = ({ profiles, onReset, ui, lang, user, activeSurveyId, setActiveProfileId, backendRecommendations }) => {
  const { profileId } = useParams();
  const [searchParams] = useSearchParams();
  const surveyIdFromQuery = searchParams.get('surveyId');
  const navigate = useNavigate();

  const profile = useMemo(() => {
    if (profileId) {
      return profiles.find((p: any) => p.id === profileId);
    }
    const activeId = localStorage.getItem('neuroprofile_active_profile_id');
    return profiles.find((p: any) => p.id === activeId);
  }, [profileId, profiles]);

  useEffect(() => {
    if (profile && profile.id !== localStorage.getItem('neuroprofile_active_profile_id')) {
      setActiveProfileId(profile.id);
    }
  }, [profile, setActiveProfileId]);

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  return (
    <Results
      answers={profile.answers}
      onReset={() => onReset(profile.id)}
      onGoHome={() => navigate('/')}
      ui={ui}
      lang={lang}
      filenamePrefix={`${profile.name || 'anonymous'}_${ProfileService.getProfileTypeLabel(profile.type, lang) || 'unknown'}`}
      user={user}
      surveyId={surveyIdFromQuery || profile.surveyId || activeSurveyId}
      initialRecommendations={backendRecommendations}
    />
  );
};

export default App;
