export interface VideoCue {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
  speaker?: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface Scene {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  summary: string;
  keyConcepts: string[];
  simpleExplanation: string; // ELI5 breakdown
  glossary: GlossaryItem[];
}

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  videoUrl: string;
  thumbnailUrl: string;
  scenes: Scene[];
  transcript: VideoCue[];
}

export interface Citation {
  sceneId: string;
  time: number;
  label: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: Citation[];
  suggestedQuestions?: string[];
  provider?: string;
}

export interface QuizQuestion {
  id: string;
  sceneId: string;
  timestamp: number;
  question: string;
  options: string[];
  correctAnswer: number; // index 0-3
  explanation: string;
}

export interface LearningNote {
  id: string;
  timestamp: number;
  sceneTitle: string;
  text: string;
  createdAt: string;
}

export interface ExplanationResponse {
  sceneId: string;
  sceneTitle: string;
  timestamp: number;
  simpleExplanation: string;
  keyConcepts: string[];
  realWorldAnalogy: string;
  quickCheck: string;
}
