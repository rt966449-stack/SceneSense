import { IAIService, AskContextParams, AskContextResponse, ExplainSceneParams, VideoSummaryResponse } from './aiService';
import { SAMPLE_VIDEO } from '../data/videoData';
import { Citation, ExplanationResponse, Scene, VideoCue } from '../types';

export class LocalContextAIService implements IAIService {
  public readonly providerName = 'Local Contextual RAG Engine (Zero API Key Required)';

  private video = SAMPLE_VIDEO;

  public async askQuestion(params: AskContextParams): Promise<AskContextResponse> {
    const { question, currentTime = 0 } = params;
    const cleanQuery = question.toLowerCase().trim();

    // 1. Identify active scene by currentTime
    const activeScene = this.getSceneAtTime(currentTime);

    // 2. Tokenize query
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'to', 'for', 'with', 'what', 'how', 'why', 'does', 'do', 'can', 'about', 'explain', 'tell', 'me']);
    const queryTokens = cleanQuery
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2 && !stopWords.has(t));

    // 3. Score transcript cues
    interface ScoredCue {
      cue: VideoCue;
      scene: Scene;
      score: number;
    }

    const scoredCues: ScoredCue[] = [];

    for (const cue of this.video.transcript) {
      const cueText = cue.text.toLowerCase();
      const parentScene = this.getSceneAtTime(cue.start) || this.video.scenes[0];
      let score = 0;

      // Active scene proximity bonus
      if (activeScene && parentScene.id === activeScene.id) {
        score += 1.5;
      }

      // Proximity to current playback timestamp bonus (within 20s)
      const timeDiff = Math.abs(cue.start - currentTime);
      if (timeDiff <= 20) {
        score += 2.0;
      }

      // Token frequency & exact match
      for (const token of queryTokens) {
        if (cueText.includes(token)) {
          score += 3.0;
        }
        // Key concept match
        for (const concept of parentScene.keyConcepts) {
          if (concept.toLowerCase().includes(token)) {
            score += 4.0;
          }
        }
        // Glossary match
        for (const item of parentScene.glossary) {
          if (item.term.toLowerCase().includes(token) || item.definition.toLowerCase().includes(token)) {
            score += 4.5;
          }
        }
      }

      if (score > 1.5) {
        scoredCues.push({ cue, scene: parentScene, score });
      }
    }

    // Sort by relevance score descending
    scoredCues.sort((a, b) => b.score - a.score);

    // Top matching cues
    const topMatches = scoredCues.slice(0, 3);

    // Citations
    const citations: Citation[] = [];
    const seenCitations = new Set<number>();

    for (const match of topMatches) {
      if (!seenCitations.has(match.cue.start)) {
        seenCitations.add(match.cue.start);
        citations.push({
          sceneId: match.scene.id,
          time: match.cue.start,
          label: `${match.scene.title} (${Math.floor(match.cue.start / 60)}:${(match.cue.start % 60).toString().padStart(2, '0')})`
        });
      }
    }

    // Formulate intelligent response grounded in the context
    let answer = '';
    const suggestedQuestions: string[] = [];

    if (topMatches.length === 0) {
      // Fallback for general questions or questions not covered
      if (activeScene) {
        answer = `While this specific query isn't directly mentioned in the transcript, you are currently at **${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}** in **"${activeScene.title}"**. \n\nIn this section: ${activeScene.summary}\n\nKey topics covered here include: ${activeScene.keyConcepts.join(', ')}.`;
        citations.push({
          sceneId: activeScene.id,
          time: activeScene.startTime,
          label: `${activeScene.title} (Active Scene)`
        });
        suggestedQuestions.push(`What is ${activeScene.keyConcepts[0]}?`);
        suggestedQuestions.push('Explain this scene simply');
      } else {
        answer = `SceneSense could not locate information matching "${question}" in this educational video. This video covers the James Webb Space Telescope's infrared mirrors, cryogenic sunshield, early cosmic observations, and exoplanet spectroscopy.`;
        suggestedQuestions.push('Why does Webb use infrared light?');
        suggestedQuestions.push('How cold does the telescope get?');
      }
    } else {
      const best = topMatches[0];
      const matchedGlossary = best.scene.glossary.find(g =>
        queryTokens.some(t => g.term.toLowerCase().includes(t))
      );

      answer = `Based on the video at **${Math.floor(best.cue.start / 60)}:${(best.cue.start % 60).toString().padStart(2, '0')}** in *${best.scene.title}*:\n\n`;
      answer += `> "${best.cue.text}"\n\n`;

      if (matchedGlossary) {
        answer += `**Key Insight (${matchedGlossary.term}):** ${matchedGlossary.definition}\n\n`;
      }

      answer += `${best.scene.summary} The instruments leverage ${best.scene.keyConcepts.join(' and ')} to observe deep space phenomena.`;

      // Generate contextually smart follow-up suggestions
      suggestedQuestions.push(`Tell me more about ${best.scene.keyConcepts[0] || 'the mirror'}`);
      suggestedQuestions.push(`Can you explain ${best.scene.title.split('. ')[1] || 'this'} in simple terms?`);
      if (best.scene.id !== 'scene-5') {
        suggestedQuestions.push('How does this compare to exoplanet spectroscopy?');
      }
    }

    return {
      answer,
      citations,
      suggestedQuestions: suggestedQuestions.slice(0, 3),
      provider: this.providerName
    };
  }

  public async explainScene(params: ExplainSceneParams): Promise<ExplanationResponse> {
    const { currentTime, sceneId } = params;
    let scene = sceneId ? this.video.scenes.find(s => s.id === sceneId) : null;
    if (!scene) {
      scene = this.getSceneAtTime(currentTime) || this.video.scenes[0];
    }

    const analogies: Record<string, { analogy: string; quickCheck: string }> = {
      'scene-1': {
        analogy: 'Imagine trying to look through a thick foggy car windshield with your eyes vs. having a thermal sensor that sees the warm deer right through the fog.',
        quickCheck: 'Why do infrared rays penetrate cosmic dust when visible light scatters?'
      },
      'scene-2': {
        analogy: 'Like folding a giant golden satellite umbrella to fit inside a backpack, then popping it open in space with sub-millimeter motorized precision.',
        quickCheck: 'What special property does gold possess for infrared astronomy?'
      },
      'scene-3': {
        analogy: 'Standing in the blazing hot desert under a massive multilayer parasol, while holding a block of dry ice in the shade.',
        quickCheck: 'What would happen to the infrared cameras if the sunshield failed?'
      },
      'scene-4': {
        analogy: 'Listening to an ambulance siren drop in pitch as it speeds away—except with light waves stretching out into red as the universe expands.',
        quickCheck: 'How does cosmological redshift help us see the universe\'s baby pictures?'
      },
      'scene-5': {
        analogy: 'Shining a flashlight through different colored bottles of liquid—each color of light absorbed reveals what kind of liquid is inside.',
        quickCheck: 'What is a biosignature and why do we look for it in alien atmospheres?'
      }
    };

    const sceneAnalogy = analogies[scene.id] || {
      analogy: 'Translating complex astrophysical engineering into everyday visual metaphors.',
      quickCheck: 'How does this technology improve our view of cosmic origins?'
    };

    return {
      sceneId: scene.id,
      sceneTitle: scene.title,
      timestamp: scene.startTime,
      simpleExplanation: scene.simpleExplanation,
      keyConcepts: scene.keyConcepts,
      realWorldAnalogy: sceneAnalogy.analogy,
      quickCheck: sceneAnalogy.quickCheck
    };
  }

  public async generateSummary(): Promise<VideoSummaryResponse> {
    return {
      videoTitle: this.video.title,
      overview: this.video.description,
      keyTakeaways: [
        'Infrared wavelengths allow Webb to penetrate dense interstellar dust and see the earliest galaxies.',
        'The 6.5-meter beryllium mirror uses 18 gold-coated hexagons folded for launch and aligned to nanometer precision.',
        'A five-layer Kapton sunshield maintains a 600°F temperature differential, keeping science cameras cooled to -388°F.',
        'Cosmological redshift stretches ancient 13.5-billion-year-old light into infrared, captured via gravitational lensing.',
        'Transmission spectroscopy decodes the chemical fingerprints of exoplanet atmospheres to detect water and biosignatures.'
      ],
      scenesSummary: this.video.scenes.map(s => ({
        sceneId: s.id,
        title: s.title,
        summary: s.summary,
        timeRange: `${Math.floor(s.startTime / 60)}:${(s.startTime % 60).toString().padStart(2, '0')} - ${Math.floor(s.endTime / 60)}:${(s.endTime % 60).toString().padStart(2, '0')}`
      }))
    };
  }

  private getSceneAtTime(time: number): Scene | undefined {
    return this.video.scenes.find(s => time >= s.startTime && time <= s.endTime) || this.video.scenes[0];
  }
}
