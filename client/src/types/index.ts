export interface VideoCue {
  id: string;
  start: number;
  end: number;
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
  simpleExplanation: string;
  glossary: GlossaryItem[];
}

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  duration: number;
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
  explanation?: string;
}

export interface QuizSubmissionResult {
  score: number;
  total: number;
  percentage: number;
  results: {
    questionId: string;
    selected: number;
    isCorrect: boolean;
    correctAnswer: number;
    explanation: string;
  }[];
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

export interface VideoSummaryResponse {
  videoTitle: string;
  overview: string;
  keyTakeaways: string[];
  scenesSummary: { sceneId: string; title: string; summary: string; timeRange: string }[];
}

export interface LearningHistoryItem {
  id: string;
  type: 'question' | 'explanation' | 'quiz' | 'note';
  title: string;
  detail: string;
  timestamp: number;
  timeFormatted: string;
  date: string;
}
