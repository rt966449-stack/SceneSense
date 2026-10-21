import { VideoMetadata, ChatMessage, ExplanationResponse, QuizQuestion, QuizSubmissionResult, VideoSummaryResponse } from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    if (!res.ok) {
      let errMsg = `Request failed with status ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.error) errMsg = errorData.error;
      } catch {}
      throw new ApiError(errMsg, res.status);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message || 'Unable to connect to SceneSense backend. Is the server running?');
  }
}

export const apiService = {
  getVideo: (): Promise<VideoMetadata> => {
    return request<VideoMetadata>('/video');
  },

  getContext: (time: number) => {
    return request<{
      currentTime: number;
      scene: any;
      activeCue: any;
      nearbyCues: any[];
    }>(`/context?time=${encodeURIComponent(time)}`);
  },

  askQuestion: (question: string, currentTime: number): Promise<{
    answer: string;
    citations: any[];
    suggestedQuestions: string[];
    provider: string;
  }> => {
    return request('/chat', {
      method: 'POST',
      body: JSON.stringify({ question, currentTime })
    });
  },

  explainScene: (time: number, sceneId?: string): Promise<ExplanationResponse> => {
    const query = sceneId ? `?time=${time}&sceneId=${encodeURIComponent(sceneId)}` : `?time=${time}`;
    return request<ExplanationResponse>(`/explain${query}`);
  },

  getQuiz: (sceneId?: string): Promise<QuizQuestion[]> => {
    const query = sceneId ? `?sceneId=${encodeURIComponent(sceneId)}` : '';
    return request<QuizQuestion[]>(`/quiz${query}`);
  },

  submitQuiz: (answers: { questionId: string; selected: number }[]): Promise<QuizSubmissionResult> => {
    return request<QuizSubmissionResult>('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  },

  getSummary: (): Promise<VideoSummaryResponse> => {
    return request<VideoSummaryResponse>('/summary');
  },

  getIntegrationsStatus: () => {
    return request<{
      mcp: any;
      alexa: any;
      notice: string;
    }>('/integrations/status');
  }
};
