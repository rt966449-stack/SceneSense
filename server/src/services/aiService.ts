import { Citation, ExplanationResponse } from '../types';

export interface AskContextParams {
  question: string;
  currentTime?: number;
  activeSceneId?: string;
}

export interface AskContextResponse {
  answer: string;
  citations: Citation[];
  suggestedQuestions: string[];
  provider: string;
}

export interface ExplainSceneParams {
  currentTime: number;
  sceneId?: string;
}

export interface VideoSummaryResponse {
  videoTitle: string;
  overview: string;
  keyTakeaways: string[];
  scenesSummary: { sceneId: string; title: string; summary: string; timeRange: string }[];
}

export interface IAIService {
  readonly providerName: string;
  askQuestion(params: AskContextParams): Promise<AskContextResponse>;
  explainScene(params: ExplainSceneParams): Promise<ExplanationResponse>;
  generateSummary(): Promise<VideoSummaryResponse>;
}
