export type {
  KBDocument,
  PresentationSlide,
  KnowledgeBase,
  CopilotCueCard,
  TranscriptItem,
  MeetingScenario,
} from '../utils/kb-engine';

export type {
  SupportedLanguage,
  MeetingPlatform,
  PlatformConfig,
  DetectedLanguageResult,
} from '../utils/translation-engine';

export type {
  PresentationConfig,
  GeneratedPresentation,
} from '../utils/presentation-generator';

export type ActiveTab = 'meet' | 'generator' | 'kb' | 'deck';
export type HudMode = 'docked-right' | 'top-teleprompter' | 'minimal-notch';
