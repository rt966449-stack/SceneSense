/**
 * MCP (Model Context Protocol) Integration Stubs & Schemas
 * 
 * NOTE: Architecture is prepared for future MCP Server integration.
 * Status: Tool specifications & handler contracts defined; MCP stdio/SSE server ready to mount.
 */

import { IAIService } from '../services/aiService';
import { SAMPLE_VIDEO, SAMPLE_QUIZ } from '../data/videoData';

export const MCP_TOOL_DEFINITIONS = [
  {
    name: 'scenesense_get_current_scene',
    description: 'Retrieves the active educational scene, glossary terms, and synchronized transcript for the current video timestamp.',
    inputSchema: {
      type: 'object',
      properties: {
        currentTime: {
          type: 'number',
          description: 'Current playback timestamp in seconds'
        }
      },
      required: ['currentTime']
    }
  },
  {
    name: 'scenesense_ask_question',
    description: 'Answers viewer questions using strictly grounded video transcript context and scene metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'The question to answer about the active or whole video'
        },
        currentTime: {
          type: 'number',
          description: 'Optional current playback timestamp in seconds'
        }
      },
      required: ['question']
    }
  },
  {
    name: 'scenesense_explain_scene',
    description: 'Generates a simple, accessible ELI5 explanation with real-world analogies for the current video topic.',
    inputSchema: {
      type: 'object',
      properties: {
        currentTime: {
          type: 'number',
          description: 'Current playback timestamp in seconds'
        }
      },
      required: ['currentTime']
    }
  },
  {
    name: 'scenesense_get_quiz',
    description: 'Fetches quiz questions for the video or active scene to test viewer comprehension.',
    inputSchema: {
      type: 'object',
      properties: {
        sceneId: {
          type: 'string',
          description: 'Optional scene identifier to filter quiz questions'
        }
      }
    }
  }
];

export class SceneSenseMCPHandler {
  private aiService: IAIService;

  constructor(aiService: IAIService) {
    this.aiService = aiService;
  }

  public getToolSpecifications() {
    return {
      status: 'Prepared (Ready for MCP Server binding)',
      protocolVersion: '2024-11-05',
      tools: MCP_TOOL_DEFINITIONS
    };
  }

  public async executeTool(toolName: string, args: Record<string, any>) {
    switch (toolName) {
      case 'scenesense_get_current_scene': {
        const time = Number(args.currentTime || 0);
        const scene = SAMPLE_VIDEO.scenes.find(s => time >= s.startTime && time <= s.endTime) || SAMPLE_VIDEO.scenes[0];
        const nearbyTranscript = SAMPLE_VIDEO.transcript.filter(c => Math.abs(c.start - time) <= 15);
        return { scene, nearbyTranscript };
      }
      case 'scenesense_ask_question': {
        return this.aiService.askQuestion({
          question: args.question,
          currentTime: args.currentTime
        });
      }
      case 'scenesense_explain_scene': {
        return this.aiService.explainScene({
          currentTime: Number(args.currentTime || 0)
        });
      }
      case 'scenesense_get_quiz': {
        const questions = args.sceneId
          ? SAMPLE_QUIZ.filter(q => q.sceneId === args.sceneId)
          : SAMPLE_QUIZ;
        return { questions };
      }
      default:
        throw new Error(`Unknown MCP Tool: ${toolName}`);
    }
  }
}
