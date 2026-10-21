/**
 * Alexa+ Skill Integration Contracts & Handler Stubs
 * 
 * NOTE: Architecture is prepared for Amazon Alexa+ multimodal integration.
 * Status: Skill manifest intents and request handlers mapped to backend AI service.
 */

import { IAIService } from '../services/aiService';
import { SAMPLE_VIDEO } from '../data/videoData';

export interface AlexaIntentRequest {
  type: 'IntentRequest';
  intent: {
    name: 'AskSceneSenseIntent' | 'ExplainSceneIntent' | 'QuizMeIntent' | 'AMAZON.HelpIntent';
    slots?: Record<string, { name: string; value: string }>;
  };
  context?: {
    videoPlayer?: {
      currentTime: number;
    };
  };
}

export interface AlexaResponseEnvelope {
  version: '1.0';
  response: {
    outputSpeech: {
      type: 'PlainText' | 'SSML';
      text: string;
    };
    shouldEndSession: boolean;
    card?: {
      type: 'Simple';
      title: string;
      content: string;
    };
  };
}

export class SceneSenseAlexaHandler {
  private aiService: IAIService;

  constructor(aiService: IAIService) {
    this.aiService = aiService;
  }

  public getStatus() {
    return {
      status: 'Prepared (Intent contracts defined & handlers linked)',
      supportedIntents: ['AskSceneSenseIntent', 'ExplainSceneIntent', 'QuizMeIntent'],
      notes: 'Ready for AWS Lambda deployment or Alexa Skills Kit proxy endpoint.'
    };
  }

  public async handleIntent(request: AlexaIntentRequest): Promise<AlexaResponseEnvelope> {
    const intentName = request.intent.name;
    const currentTime = request.context?.videoPlayer?.currentTime || 0;

    switch (intentName) {
      case 'AskSceneSenseIntent': {
        const questionSlot = request.intent.slots?.['Question']?.value || 'What is happening right now?';
        const result = await this.aiService.askQuestion({ question: questionSlot, currentTime });
        return {
          version: '1.0',
          response: {
            outputSpeech: {
              type: 'PlainText',
              text: result.answer.replace(/[*#>_]/g, '')
            },
            card: {
              type: 'Simple',
              title: 'SceneSense Answer',
              content: result.answer
            },
            shouldEndSession: false
          }
        };
      }
      case 'ExplainSceneIntent': {
        const explanation = await this.aiService.explainScene({ currentTime });
        const speech = `${explanation.sceneTitle}. In simple terms: ${explanation.simpleExplanation} For example: ${explanation.realWorldAnalogy}`;
        return {
          version: '1.0',
          response: {
            outputSpeech: {
              type: 'PlainText',
              text: speech
            },
            card: {
              type: 'Simple',
              title: `Explaining: ${explanation.sceneTitle}`,
              content: explanation.simpleExplanation
            },
            shouldEndSession: false
          }
        };
      }
      default:
        return {
          version: '1.0',
          response: {
            outputSpeech: {
              type: 'PlainText',
              text: 'You can say: Alexa, ask SceneSense why the mirror is gold, or say explain this scene.'
            },
            shouldEndSession: false
          }
        };
    }
  }
}
