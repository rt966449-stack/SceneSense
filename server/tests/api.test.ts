import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';

describe('SceneSense Backend API Tests', () => {
  it('GET /health returns healthy status and aiProvider', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.aiProvider).toBeDefined();
  });

  it('GET /api/video returns educational video metadata and scenes', async () => {
    const res = await request(app).get('/api/video');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.scenes.length).toBeGreaterThanOrEqual(5);
    expect(res.body.data.transcript.length).toBeGreaterThanOrEqual(15);
  });

  it('GET /api/context calculates active scene and cue for timestamp', async () => {
    const res = await request(app).get('/api/context?time=50');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.scene.id).toBe('scene-2');
    expect(res.body.data.scene.title).toContain('Gold Beryllium Mirror');
  });

  it('POST /api/chat provides grounded response with citations', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ question: 'Why is the mirror made of gold?', currentTime: 50 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.answer).toBeDefined();
    expect(res.body.data.citations.length).toBeGreaterThan(0);
    expect(res.body.data.provider).toBeDefined();
  });

  it('GET /api/explain returns ELI5 simple breakdown', async () => {
    const res = await request(app).get('/api/explain?time=15');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.simpleExplanation).toBeDefined();
    expect(res.body.data.realWorldAnalogy).toBeDefined();
  });

  it('GET /api/quiz returns sanitized questions without leaking answers', async () => {
    const res = await request(app).get('/api/quiz');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    // Ensure correctAnswer is stripped for security
    expect(res.body.data[0].correctAnswer).toBeUndefined();
    expect(res.body.data[0].options.length).toBe(4);
  });

  it('POST /api/quiz/submit evaluates scores accurately', async () => {
    const res = await request(app)
      .post('/api/quiz/submit')
      .send({
        answers: [
          { questionId: 'q-1', selected: 1 }, // Correct
          { questionId: 'q-2', selected: 3 }  // Incorrect (correct is 0)
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.score).toBe(1);
    expect(res.body.data.total).toBe(2);
    expect(res.body.data.percentage).toBe(50);
  });

  it('GET /api/integrations/status returns MCP and Alexa+ architecture schemas', async () => {
    const res = await request(app).get('/api/integrations/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mcp.tools.length).toBeGreaterThanOrEqual(4);
    expect(res.body.data.alexa.supportedIntents.length).toBeGreaterThanOrEqual(3);
  });
});
