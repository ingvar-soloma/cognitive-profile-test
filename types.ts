export type Language = 'uk' | 'en' | 'ru';

export type LocalizedString = Record<Language, string>;

export enum QuestionType {
  SCALE = 'SCALE', // 1-5 rating
  CHOICE = 'CHOICE', // Radio buttons
  TEXT = 'TEXT', // Text input only
  DRAWING = 'DRAWING', // Drawing canvas
}

export interface Option {
  label: LocalizedString;
  value: string;
}

export interface Question {
  id: string;
  text: LocalizedString;
  type: QuestionType;
  options?: Option[]; // For CHOICE type
  placeholder?: LocalizedString; // For TEXT type
  category: string; // Internal ID for logic
  subCategory?: LocalizedString; // Display text
  hint?: LocalizedString; // Added optional hint/example text
  examples?: LocalizedString[]; // Short descriptions of how others experience this
}

// Flat version for components after localization is applied
export interface LocalizedQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: { label: string; value: string }[];
  placeholder?: string;
  category: string;
  subCategory?: string;
  hint?: string;
  examples?: string[];
}

export interface Answer {
  questionId: string;
  value: string | number | null; // scale number or choice value
  note: string; // The optional text description
}

export interface CategoryData {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  questions: Question[];
}

// Flat version for components
export interface LocalizedCategoryData {
  id: string;
  title: string;
  description: string;
  questions: LocalizedQuestion[];
}

export interface ScaleConfig {
  min: number;
  max: number;
  labels: Record<number, LocalizedString>;
}

export interface LocalizedScaleConfig {
  min: number;
  max: number;
  labels: Record<number, string>;
}

export interface SurveyDefinition {
  id: string;
  parentId?: string;
  disabled?: boolean;
  aiEnabled?: boolean; // New property
  title: LocalizedString;
  description?: LocalizedString;
  categories: CategoryData[];
  scaleConfig?: ScaleConfig; // Optional custom scale configuration
}

export interface LocalizedSurveyDefinition {
  id: string;
  title: string;
  description?: string;
  categories: LocalizedCategoryData[];
  scaleConfig?: LocalizedScaleConfig;
}

export interface UIStrings {
  title: string;
  description: string;
  start: string;
  resume: string; // For file upload button or similar
  back: string;
  next: string;
  finish: string;
  export: string;
  import: string;
  reset: string;
  saveJson: string;
  saveToon: string; // Added TOON label
  scale1: string;
  scale2: string;
  scale3: string;
  scale4: string;
  scale5: string;
  yourAnswer: string;
  optionalComment: string;
  resultsTitle: string;
  resultsDesc: string;
  sensoryMap: string;
  scoreDetails: string;
  notesTitle: string;
  noNotes: string;
  downloadJson: string;
  retake: string;
  progress: string;
  completed: string;
  part: string;
  of: string;
  howToRate: string;
  howToRateTitle: string;
  profileAphantasia: string;
  profileHypophantasia: string;
  profileHyperphantasia: string;
  profilePhantasia: string;
  manageProfiles: string;
  profileName: string;
  createProfile: string;
  deleteProfile: string;
  switchProfile: string;
  activeProfile: string;
  noProfiles: string;
  unanswered: string;
  scrollToUnanswered: string;
  importAnswers: string;
  selectProfileToImport: string;
  compareAnswers: string;
  existingValue: string;
  newValue: string;
  mergeOverwrite: string;
  keepExisting: string;
  importSummary: string;
  close: string;
  confirmImport: string;
  similarity: string;
  createNewProfile: string;
  importedProfile: string;
  goHome: string;
  downloadQuestions: string;
  selectTestToDownload: string;
  disclaimerTitle: string;
  disclaimer: string;
  complianceDisclaimer: string;
  gdprTitle: string;
  gdprText: string;
  contactTitle: string;
  contactText: string;
  privacyPolicy: string;
  legalInfo: string;
  dataUsage: string;
  deleteData: string;
  emailTemplateTitle: string;
  emailTemplateBody: string;
  dataFromGoogle: string;
  deleteDataDesc: string;
  contactAdmin: string;
  principles: string;
  anonymity: string;
  anonymityDesc: string;
  security: string;
  securityDesc: string;
  transparency: string;
  transparencyDesc: string;
  accept: string;
  consentTitle: string;
  consentCheckbox: string;
  showResults: string;
  undo: string;
  redo: string;
  clear: string;
  drawHint: string;
  pleaseAnswerAll: string;
  loginRequired: string;
  generationCost: string;
  firstGenerationFree: string;
  regenerate: string;
  loginToContinue: string;
  loginModalTitle: string;
  loginModalDesc: string;
  logout: string;
  navTests: string;
  navResults: string;
  navRecommendations: string;
  recommendationsTitle: string;
  recommendationsLocked: string;
  careerAdvisor: string;
  worldview: string;
  selfExploration: string;
  mediaRecs: string;
  creativityRecs: string;
  creditsRequired: string;
  resultsHistoryDesc: string;
  noTestsYet: string;
  goToTests: string;
  answersLabel: string;
  dateLabel: string;
  recommendationsDesc: string;
  credits: string;
  recommendationsLockedDesc: string;
  recommendationsCTATitle: string;
  recommendationsCTADesc: string;
  recommendationsCTAButton: string;
  careerAdvisorDesc: string;
  worldviewDesc: string;
  selfExplorationDesc: string;
  mediaRecsDesc: string;
  creativityRecsDesc: string;
  jumpToGemini: string;
  jumpToGeminiDesc: string;
  copyToClipboard: string;
  continueToGemini: string;
  copied: string;
  readyToUse: string;
  clickToCustomize: string;
  freeInBeta: string;
  workshopResume: string;
  workshopCoverLetter: string;
  exploreJobIdeas: string;
  customPromptTitle: string;
  customPromptPlaceholder: string;
  promptCopied: string;
  tryExpressTest: string;
  privateProfileTitle: string;
  privateProfileDesc: string;
  privateProfileCTA: string;
  readMore: string;
  whyTakeTest: string;
  marketingTitle: string;
  marketingPoint1Title: string;
  marketingPoint1Desc: string;
  marketingPoint2Title: string;
  marketingPoint2Desc: string;
  marketingPoint3Title: string;
  marketingPoint3Desc: string;
  marketingPoint4Title: string;
  marketingPoint4Desc: string;
  howOthersSeeIt: string;
  timeSpent: string;
  predictedTime: string;
  minutesShort: string;
  secondsShort: string;
  cognitiveAssessment: string;
  heroTitle: string;
  heroSubtitle: string;
  selectExplorationFormat: string;
  readyForAnalysis: string;
  soon: string;
  minutesLabel: string;
  analyze: string;
  viewResults: string;
  editAnswers: string;
  sectionLabel: string;
  errorFound: string;
  returnToSurvey: string;
  analysisReadyDesc: string;
  whyExploreTitle: string;
  aphantasiaLabel: string;
  hyperphantasiaLabel: string;
  vagueLabel: string;
  systemDatabase: string;
  activeUsersCount: string;
  searchUsersPlaceholder: string;
  testsFound: string;
  noUsersFound: string;
  securityPrivacy: string;
  systemRecords: string;
  totalEntriesAnalyzed: string;
  searchAdminPlaceholder: string;
  userProfile: string;
  testSpecification: string;
  timestamp: string;
  actions: string;
  fullCognitiveProfile: string;
  expressDiagnostics: string;
  answersProvided: string;
  details: string;
  noRecordsFound: string;
  aiAnalysisTitle: string;
  synthesizingInsights: string;
  connectingNodes: string;
  unlockNarrativeTitle: string;
  unlockNarrativeDesc: string;
  sensorySignaturePending: string;
  authenticatedProfilesOnly: string;
  detailedSensoryMapping: string;
  sensorySignatureMap: string;
  intensity: string;
  archivalOptions: string;
  managementArchival: string;
  finishLanguageTitle: string;
  finishLanguageNote: string;
  finishLanguageQuestion: string;
  confirmFinishAndGenerate: string;
  changeLanguage: string;
  // About page
  navAbout: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutWhatIsAphantasia: string;
  aboutWhatIsAphantasiaDesc: string;
  aboutSpectrum: string;
  aboutSpectrumDesc: string;
  aboutHowCommon: string;
  aboutHowCommonDesc: string;
  aboutWhoDiscovered: string;
  aboutWhoDiscoveredDesc: string;
  aboutCtaTitle: string;
  aboutCtaDesc: string;
  // FAQ page
  navFaq: string;
  faqTitle: string;
  faqSubtitle: string;
  // Terms page
  navTerms: string;
  termsTitle: string;
  termsSubtitle: string;
  termsUsage: string;
  termsUsageDesc: string;
  termsAiDisclaimer: string;
  termsAiDisclaimerDesc: string;
  termsCredits: string;
  termsCreditsDesc: string;
  termsChanges: string;
  termsChangesDesc: string;
  termsLastUpdated: string;
  // HowItWorks page
  navHowItWorks: string;
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  // Landing page nav
  navLanding: string;
  landingCtaButton: string;
  landingLearnMore: string;
  navNews: string;
  // Newsletter
  subscribeTitle: string;
  subscribeSubtitle: string;
  subscribePlaceholder: string;
  subscribeButton: string;
  subscribeSuccess: string;
  subscribeAlreadySubscribed: string;
  subscribeInvalidEmail: string;
  subscribeError: string;
  languageSyncNote: string;
  demoCtaTitle: string;
  demoCtaDesc: string;
  demoCtaButton: string;
  chooseTone: string;
  toneProfessional: string;
  toneFriendly: string;
  toneHelp: string;
  shareProfile: string;
  shareDescription: string;
  shareReddit: string;
  shareLinkedIn: string;
  publicProfile: string;
  privateProfile: string;
  editProfileSettings: string;
  previewPublic: string;
  visitorCtaTitle: string;
  visitorCtaDesc: string;
  visitorCtaButton: string;
  settingsNicknameLabel: string;
  settingsPrivacyLabel: string;
  settingsPrivacyDesc: string;
  navBlog: string;
  share: string;
  shareResult: string;
  shareNews: string;
  copyLink: string;
  linkCopied: string;
  sectionCareer: string;
  sectionCareerDesc: string;
  sectionSelf: string;
  sectionSelfDesc: string;
  sectionCreativity: string;
  sectionCreativityDesc: string;
  sectionRelationships: string;
  sectionRelationshipsDesc: string;
  cognitiveAudit: string;
  cognitiveAuditDesc: string;
  brainstormPartner: string;
  brainstormPartnerDesc: string;
  interpersonal: string;
  interpersonalDesc: string;
  newLabel: string;
  resultsToRecommendations: string;
  navEarlyAccess: string;
  earlyAccessTitle: string;
  earlyAccessSubtitle: string;
  earlyAccessConcept: string;
  earlyAccessCta: string;
  earlyAccessSuccess: string;
  tryExpressFree: string;
  expressDiagnosticsCta: string;
  musicMastery: string;
  musicMasteryDesc: string;
  aiPromptLabel: string;
  conflictTriggers: string;
  conflictTriggersDesc: string;
}

export enum ProfileType {
  APHANTASIA = 'APHANTASIA',
  HYPOPHANTASIA = 'HYPOPHANTASIA',
  PHANTASIA = 'PHANTASIA',
  HYPERPHANTASIA = 'HYPERPHANTASIA',
}

export interface Profile {
  id: string;
  name: string;
  type?: ProfileType; // Based on results
  answers: Record<string, Record<string, Answer>>; // surveyId -> questions
  timeSpent?: Record<string, number>; // surveyId -> total seconds spent
  lastUpdated: string;
  surveyId: string;
  badges?: Badge[];
  tone?: string;
  gemini_recommendations?: Record<string, string>;
  is_public?: boolean;
  public_nickname?: string;
  share_id?: string | null;
}

export interface Badge {
  id: number;
  code: string;
  name: string;
  icon?: string;
  description?: string;
  is_active: boolean;
  is_secret: boolean;
  assigned_at?: string;
}
export interface FeatureFlag {
  code: string;
  name: string;
  description?: string;
  is_enabled: boolean;
}

export interface User {
  id: string | number;
  public_id?: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
  credits?: number;
  referral_count?: number;
}
