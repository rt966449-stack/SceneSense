import { Router, Request, Response } from 'express';
import { SAMPLE_VIDEO, SAMPLE_QUIZ } from '../data/videoData';
import { IAIService } from '../services/aiService';
import { SceneSenseMCPHandler } from '../integrations/mcpTools';
import { SceneSenseAlexaHandler } from '../integrations/alexaSkill';

export function createApiRouter(aiService: IAIService): Router {
  const router = Router();
  const mcpHandler = new SceneSenseMCPHandler(aiService);
  const alexaHandler = new SceneSenseAlexaHandler(aiService);

  // 1. Get full video data & scenes
  router.get('/video', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: SAMPLE_VIDEO
    });
  });

  // 2. Real-time context at specific playback timestamp
  router.get('/context', (req: Request, res: Response) => {
    const time = parseFloat(req.query.time as string) || 0;

    const currentScene = SAMPLE_VIDEO.scenes.find(
      s => time >= s.startTime && time <= s.endTime
    ) || SAMPLE_VIDEO.scenes[0];

    const currentCue = SAMPLE_VIDEO.transcript.find(
      c => time >= c.start && time <= c.end
    );

    const nearbyCues = SAMPLE_VIDEO.transcript.filter(
      c => Math.abs(c.start - time) <= 20
    );

    res.json({
      success: true,
      data: {
        currentTime: time,
        scene: currentScene,
        activeCue: currentCue || null,
        nearbyCues
      }
    });
  });

  // 3. Ask SceneSense Chat
  router.post('/chat', async (req: Request, res: Response) => {
    try {
      const { question, currentTime } = req.body;

      if (!question || typeof question !== 'string' || question.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Question is required and must be a non-empty string.'
        });
      }

      const answerData = await aiService.askQuestion({
        question: question.trim(),
        currentTime: typeof currentTime === 'number' ? currentTime : 0
      });

      res.json({
        success: true,
        data: answerData
      });
    } catch (error: any) {
      console.error('[API /chat] Error handling question:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error while processing question.'
      });
    }
  });

  // 4. Simple Explanation Mode (ELI5)
  router.get('/explain', async (req: Request, res: Response) => {
    try {
      const time = parseFloat(req.query.time as string) || 0;
      const sceneId = req.query.sceneId as string | undefined;

      const explanation = await aiService.explainScene({
        currentTime: time,
        sceneId
      });

      res.json({
        success: true,
        data: explanation
      });
    } catch (error: any) {
      console.error('[API /explain] Error generating explanation:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate explanation.'
      });
    }
  });

  // 5. Quiz Questions
  router.get('/quiz', (req: Request, res: Response) => {
    const sceneId = req.query.sceneId as string | undefined;
    const questions = sceneId
      ? SAMPLE_QUIZ.filter(q => q.sceneId === sceneId)
      : SAMPLE_QUIZ;

    // Strip out correctAnswer for client-side evaluation security
    const sanitizedQuestions = questions.map(({ correctAnswer, ...q }) => q);

    res.json({
      success: true,
      data: sanitizedQuestions
    });
  });

  // 6. Submit Quiz Answers (Real evaluation, never fake success)
  router.post('/quiz/submit', (req: Request, res: Response) => {
    try {
      const { answers } = req.body; // Array of { questionId: string, selected: number }

      if (!Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          error: 'Answers must be an array of { questionId, selected }'
        });
      }

      let score = 0;
      const results = answers.map(item => {
        const question = SAMPLE_QUIZ.find(q => q.id === item.questionId);
        if (!question) {
          return {
            questionId: item.questionId,
            selected: item.selected,
            isCorrect: false,
            correctAnswer: -1,
            explanation: 'Question not found'
          };
        }

        const isCorrect = question.correctAnswer === item.selected;
        if (isCorrect) score++;

        return {
          questionId: question.id,
          selected: item.selected,
          isCorrect,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation
        };
      });

      res.json({
        success: true,
        data: {
          score,
          total: answers.length,
          percentage: answers.length > 0 ? Math.round((score / answers.length) * 100) : 0,
          results
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error evaluating quiz'
      });
    }
  });

  // 7. Video Summary & Key Takeaways
  router.get('/summary', async (req: Request, res: Response) => {
    try {
      const summary = await aiService.generateSummary();
      res.json({
        success: true,
        data: summary
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Error generating summary'
      });
    }
  });

  // 8. Integrations Status (MCP & Alexa+ readiness)
  router.get('/integrations/status', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        mcp: mcpHandler.getToolSpecifications(),
        alexa: alexaHandler.getStatus(),
        notice: 'Architecture is prepared with tool schemas and intent handlers. External connectivity will be activated upon deploying to the respective host.'
      }
    });
  });

  return router;
}
