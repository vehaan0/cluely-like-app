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

export type ActiveTab = 'hud' | 'generator' | 'kb' | 'providers';
export type HudMode = 'docked-full' | 'teleprompter-notch' | 'compact-sidebar';

export type AIProviderType = 'gemini' | 'openrouter' | 'ollama' | 'lmstudio' | 'local-engine';

export interface AIProviderConfig {
  activeProvider: AIProviderType;
  geminiModel: string;
  customGeminiKey?: string;
  openRouterModel: string;
  customOpenRouterKey?: string;
  ollamaEndpoint: string;
  ollamaModel: string;
  lmStudioEndpoint: string;
  lmStudioModel: string;
  temperature: number;
}
