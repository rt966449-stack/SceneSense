import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Navbar } from '../src/components/Navbar';
import { ContextPanel } from '../src/components/ContextPanel';
import { ErrorAlert } from '../src/components/ErrorAlert';

describe('SceneSense Frontend Component Tests', () => {
  it('Navbar renders brand and switches tabs', () => {
    const setActiveTab = vi.fn();
    const onOpenIntegrations = vi.fn();
    const onOpenExplainer = vi.fn();

    render(
      <Navbar
        activeTab="view"
        setActiveTab={setActiveTab}
        aiProvider="Local RAG"
        onOpenIntegrations={onOpenIntegrations}
        onOpenExplainer={onOpenExplainer}
      />
    );

    expect(screen.getByText(/Scene/i)).toBeInTheDocument();
    expect(screen.getByText(/Watch & Context/i)).toBeInTheDocument();

    const quizTab = screen.getByText(/Interactive Quiz/i);
    fireEvent.click(quizTab);
    expect(setActiveTab).toHaveBeenCalledWith('quiz');
  });

  it('ContextPanel displays active scene and cues', () => {
    const onSeek = vi.fn();
    const onOpenExplainer = vi.fn();

    const mockScene = {
      id: 'scene-1',
      title: 'Infrared Astronomy',
      startTime: 0,
      endTime: 30,
      summary: 'Observing deep space in infrared.',
      keyConcepts: ['Infrared', 'Dust Clouds'],
      simpleExplanation: 'Looking through space dust.',
      glossary: [{ term: 'Infrared', definition: 'Heat radiation.' }]
    };

    const mockTranscript = [
      { id: 'c1', start: 0, end: 5, text: 'Welcome to Webb.', speaker: 'Narrator' },
      { id: 'c2', start: 5, end: 15, text: 'Piercing through interstellar dust.', speaker: 'Scientist' }
    ];

    render(
      <ContextPanel
        currentTime={2}
        activeScene={mockScene}
        transcript={mockTranscript}
        onSeek={onSeek}
        onOpenExplainer={onOpenExplainer}
      />
    );

    expect(screen.getByText('Infrared Astronomy')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Webb.')).toBeInTheDocument();

    // Click cue to seek
    const secondCue = screen.getByText('Piercing through interstellar dust.');
    fireEvent.click(secondCue);
    expect(onSeek).toHaveBeenCalledWith(5);
  });

  it('ErrorAlert renders message and triggers retry', () => {
    const onRetry = vi.fn();
    render(<ErrorAlert message="Backend connection timed out" onRetry={onRetry} />);

    expect(screen.getByText('Backend connection timed out')).toBeInTheDocument();
    const retryBtn = screen.getByText('Retry');
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
