import { IAIService, AskContextParams, AskContextResponse, ExplainSceneParams, VideoSummaryResponse } from './aiService';
import { LocalContextAIService } from './localAi';
import { SAMPLE_VIDEO } from '../data/videoData';
import { ExplanationResponse } from '../types';

export class ExternalAIService implements IAIService {
  public readonly providerName: string;
  private apiKey: string;
  private fallbackService: LocalContextAIService;

  constructor(provider: 'openai' | 'gemini', apiKey: string) {
    this.providerName = `External LLM (${provider.toUpperCase()})`;
    this.apiKey = apiKey;
    this.fallbackService = new LocalContextAIService();
  }

  public async askQuestion(params: AskContextParams): Promise<AskContextResponse> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      console.warn('[ExternalAIService] No valid API key configured. Falling back to local RAG service.');
      return this.fallbackService.askQuestion(params);
    }

    try {
      // Craft strict grounding prompt with transcript context
      const relevantCues = SAMPLE_VIDEO.transcript
        .filter(c => Math.abs(c.start - (params.currentTime || 0)) < 45)
        .map(c => `[${Math.floor(c.start / 60)}:${(c.start % 60).toString().padStart(2, '0')}] ${c.speaker || 'Narrator'}: ${c.text}`)
        .join('\n');

      const systemPrompt = `You are SceneSense, an intelligent TV viewing assistant for an educational video about the James Webb Space Telescope.
Current video time: ${params.currentTime || 0} seconds.
Relevant transcript window:
${relevantCues}

Answer the user's question concisely in 2-4 sentences, strictly grounded in the video facts. Mention timestamps when appropriate.`;

      // Example fetch to OpenAI-compatible endpoint
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: params.question }
          ],
          temperature: 0.3,
          max_tokens: 250
        })
      });

      if (!response.ok) {
        throw new Error(`External API responded with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || 'No response generated.';

      // Reuse local citations for accuracy
      const localResult = await this.fallbackService.askQuestion(params);

      return {
        answer: content,
        citations: localResult.citations,
        suggestedQuestions: localResult.suggestedQuestions,
        provider: this.providerName
      };
    } catch (error) {
      console.error('[ExternalAIService] API error, falling back to LocalContextAIService:', error);
      return this.fallbackService.askQuestion(params);
    }
  }

  public async explainScene(params: ExplainSceneParams): Promise<ExplanationResponse> {
    // Falls back to high-fidelity structured scene breakdown
    return this.fallbackService.explainScene(params);
  }

  public async generateSummary(): Promise<VideoSummaryResponse> {
    return this.fallbackService.generateSummary();
  }
}

export function createAIService(): IAIService {
  const provider = (process.env.AI_PROVIDER || 'local').toLowerCase();
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  if (provider === 'openai' && apiKey) {
    console.log('[SceneSense] Initializing External OpenAI Service...');
    return new ExternalAIService('openai', apiKey);
  }

  if (provider === 'gemini' && apiKey) {
    console.log('[SceneSense] Initializing External Gemini Service...');
    return new ExternalAIService('gemini', apiKey);
  }

  console.log('[SceneSense] Initializing LocalContextAIService (Zero API Key Offline Mode)...');
  return new LocalContextAIService();
}
