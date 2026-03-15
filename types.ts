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
  gdprTitle: string;
  gdprText: string;
  contactTitle: string;
  contactText: string;
  privacyPolicy: string;
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
  loginRequired: string;
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
  careerAdvisorDesc: string;
  worldviewDesc: string;
  selfExplorationDesc: string;
  mediaRecsDesc: string;
  creativityRecsDesc: string;
  selectTestTitle: string;
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
  lastUpdated: string;
  surveyId: string;
}
