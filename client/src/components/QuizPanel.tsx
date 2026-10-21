import React, { useState, useEffect } from 'react';
import { HelpCircle, Award, CheckCircle2, XCircle, RotateCcw, Clock, ArrowRight, Bookmark } from 'lucide-react';
import { QuizQuestion, QuizSubmissionResult } from '../types';
import { apiService } from '../services/api';
import { ErrorAlert } from './ErrorAlert';

interface QuizPanelProps {
  onSeek: (time: number) => void;
  onSaveToHistory: (title: string, detail: string, timestamp: number) => void;
}

export const QuizPanel: React.FC<QuizPanelProps> = ({ onSeek, onSaveToHistory }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    setLoading(true);
    setError(null);
    setSubmissionResult(null);
    setAnswers({});
    setIsSaved(false);
    try {
      const data = await apiService.getQuiz();
      setQuestions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submissionResult) return; // Prevent change after submit
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) return;

    setSubmitting(true);
    setError(null);

    const payload = Object.entries(answers).map(([questionId, selected]) => ({
      questionId,
      selected
    }));

    try {
      const result = await apiService.submitQuiz(payload);
      setSubmissionResult(result);
    } catch (err: any) {
      setError(err.message || 'Error evaluating quiz submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveResult = () => {
    if (!submissionResult) return;
    onSaveToHistory(
      `Quiz Completed: ${submissionResult.score}/${submissionResult.total} (${submissionResult.percentage}%)`,
      `Answered ${submissionResult.total} questions regarding James Webb infrared optics, mirror engineering, and spectroscopy.`,
      0
    );
    setIsSaved(true);
  };

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Quiz Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Comprehension Challenge</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Test your grasp of James Webb infrared astronomy & spacecraft engineering.
            </p>
          </div>
        </div>

        {submissionResult && (
          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-cyan-500/30">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Your Score</div>
              <div className="text-lg font-black text-cyan-300 font-mono">
                {submissionResult.score} / {submissionResult.total} ({submissionResult.percentage}%)
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <ErrorAlert message={error} onRetry={loadQuiz} />}

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-slate-300 font-medium">Generating quiz from video context...</p>
        </div>
      )}

      {/* Questions List */}
      {!loading && questions.length > 0 && (
        <div className="space-y-5">
          {questions.map((q, qIndex) => {
            const selectedOption = answers[q.id];
            const resultItem = submissionResult?.results.find(r => r.questionId === q.id);

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all ${
                  resultItem
                    ? resultItem.isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-red-950/20 border-red-500/40'
                    : 'bg-[#121927] border-slate-800'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center font-mono">
                      {qIndex + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  {/* Scene Jump Button */}
                  <button
                    onClick={() => onSeek(q.timestamp)}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[11px] text-cyan-300 transition font-mono"
                    title="Jump video to relevant scene"
                  >
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{Math.floor(q.timestamp / 60)}:{(q.timestamp % 60).toString().padStart(2, '0')}</span>
                  </button>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    let optionStyle = 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300';

                    if (resultItem) {
                      if (optIdx === resultItem.correctAnswer) {
                        optionStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-medium';
                      } else if (isSelected && !resultItem.isCorrect) {
                        optionStyle = 'bg-red-950/50 border-red-500 text-red-200';
                      } else {
                        optionStyle = 'bg-slate-900/40 border-slate-800/60 opacity-60 text-slate-400';
                      }
                    } else if (isSelected) {
                      optionStyle = 'bg-cyan-950/70 border-cyan-500 text-cyan-200 font-medium shadow-sm shadow-cyan-950/40';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={!!submissionResult}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full border border-current text-[10px] flex items-center justify-center font-mono shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {resultItem && optIdx === resultItem.correctAnswer && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                        {resultItem && isSelected && !resultItem.isCorrect && (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation feedback after submit */}
                {resultItem && (
                  <div className={`mt-3.5 p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                    resultItem.isCorrect
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-950/30 border-red-500/30 text-red-300'
                  }`}>
                    <div className="flex-1">
                      <span className="font-bold block mb-0.5">
                        {resultItem.isCorrect ? 'Correct!' : 'Incorrect:'}
                      </span>
                      <span>{resultItem.explanation}</span>
                    </div>

                    {!resultItem.isCorrect && (
                      <button
                        onClick={() => onSeek(q.timestamp)}
                        className="shrink-0 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[10px] transition"
                      >
                        Rewatch Scene
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quiz Submission & Reset Actions */}
      {!loading && questions.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {submissionResult ? (
              <span>Quiz evaluated. Review results above or retry.</span>
            ) : (
              <span>
                Answered <span className="text-cyan-400 font-bold">{Object.keys(answers).length}</span> of <span className="font-bold">{questions.length}</span> questions.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {submissionResult ? (
              <>
                <button
                  onClick={handleSaveResult}
                  disabled={isSaved}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    isSaved
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isSaved ? 'Saved to History' : 'Save Score to Notes'}</span>
                </button>
                <button
                  onClick={loadQuiz}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length === 0}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white text-xs font-bold transition shadow-md shadow-cyan-600/20"
              >
                {submitting ? (
                  <span>Grading Answers...</span>
                ) : (
                  <>
                    <span>Submit Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
