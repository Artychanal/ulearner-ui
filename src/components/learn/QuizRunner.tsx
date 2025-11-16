"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { QuizAttempt, QuizContent, QuizQuestion } from "@/types/course";

type SubmitPayload = {
  selectedOptionIndexes: number[];
  scoredPoints: number;
  totalPoints: number;
};

type QuizRunnerProps = {
  quiz: QuizContent;
  attempt: QuizAttempt | null;
  onSubmit: (payload: SubmitPayload) => void | Promise<void>;
};

const PASSING_PERCENTAGE = 80;

function buildBlankSelection(length: number) {
  return Array.from({ length }, () => -1);
}

function normalizeQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.map((question) => {
    const options =
      Array.isArray(question.options) && question.options.length >= 2
        ? question.options
        : ["Option A", "Option B"];
    const answerIndex =
      typeof question.answerIndex === "number" && question.answerIndex >= 0 && question.answerIndex < options.length
        ? question.answerIndex
        : 0;
    return {
      ...question,
      options,
      answerIndex,
    };
  });
}

function formatTimestamp(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function QuizRunner({ quiz, attempt, onSubmit }: QuizRunnerProps) {
  const normalizedQuestions = useMemo(() => normalizeQuestions(quiz.questions ?? []), [quiz.questions]);
  const [selections, setSelections] = useState<number[]>(() =>
    attempt ? [...attempt.selectedOptionIndexes] : buildBlankSelection(normalizedQuestions.length),
  );
  const [isEditing, setIsEditing] = useState<boolean>(() => !attempt);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAttempt, setPendingAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    if (!attempt) {
      setSelections(buildBlankSelection(normalizedQuestions.length));
      setIsEditing(true);
      setPendingAttempt(null);
      return;
    }
    setSelections(() => {
      const base = buildBlankSelection(normalizedQuestions.length);
      attempt.selectedOptionIndexes.forEach((value, index) => {
        if (index < base.length) {
          base[index] = value;
        }
      });
      return base;
    });
    setIsEditing(false);
    setPendingAttempt(null);
  }, [attempt, normalizedQuestions.length]);

  const answeredCount = useMemo(() => selections.filter((index) => index >= 0).length, [selections]);
  const allAnswered = answeredCount === normalizedQuestions.length;
  const activeAttempt = attempt ?? pendingAttempt;

  const currentScore = useMemo(() => {
    if (!activeAttempt) {
      return null;
    }
    const total =
      activeAttempt.totalPoints || normalizedQuestions.reduce((sum, question) => sum + (question.points ?? 0), 0);
    return {
      scored: activeAttempt.scoredPoints,
      total,
      percentage: total ? Math.round((activeAttempt.scoredPoints / total) * 100) : 0,
    };
  }, [activeAttempt, normalizedQuestions]);

  const handleSelect = useCallback(
    (questionIndex: number, optionIndex: number) => {
      if (!isEditing) {
        return;
      }
      setSelections((prev) => {
        const next = [...prev];
        next[questionIndex] = optionIndex;
        return next;
      });
    },
    [isEditing],
  );

  const submitAttempt = useCallback(async () => {
    if (!isEditing || isSubmitting) {
      return;
    }

    if (!allAnswered) {
      setErrorMessage("Answer every question before submitting.");
      return;
    }

    const totalPoints = quiz.totalPoints ?? normalizedQuestions.reduce((total, question) => total + (question.points ?? 0), 0);
    const scoredPoints = normalizedQuestions.reduce((total, question, index) => {
      const selectedIndex = selections[index];
      return selectedIndex === question.answerIndex ? total + question.points : total;
    }, 0);

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        selectedOptionIndexes: selections,
        scoredPoints,
        totalPoints,
      });
      setPendingAttempt({
        quizId: quiz.id,
        selectedOptionIndexes: selections,
        scoredPoints,
        totalPoints,
        completedAt: new Date().toISOString(),
      });
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [allAnswered, isEditing, isSubmitting, normalizedQuestions, onSubmit, quiz.id, quiz.totalPoints, selections]);

  const startRetake = useCallback(() => {
    if (!activeAttempt) {
      return;
    }
    setPendingAttempt(null);
    setIsEditing(true);
    setErrorMessage(null);
  }, [activeAttempt]);

  return (
    <div className="d-flex flex-column gap-4">
      <header className="d-flex flex-column gap-2">
        <h2 className="h4 fw-semibold mb-0">{quiz.title}</h2>
        <p className="text-secondary small mb-0">
          Quiz worth {quiz.totalPoints ?? normalizedQuestions.reduce((sum, question) => sum + (question.points ?? 0), 0)} pts
        </p>
        {activeAttempt && currentScore && (
          <div className={`alert ${currentScore.percentage >= PASSING_PERCENTAGE ? "alert-success" : "alert-info"} mb-0`}>
            <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
              <span>
                Latest score: <strong>{activeAttempt.scoredPoints}</strong> / {activeAttempt.totalPoints} pts
                <span className="ms-2 badge bg-primary-subtle text-primary">{currentScore.percentage}%</span>
              </span>
              <span className="text-secondary small">
                {pendingAttempt && !attempt ? "Waiting for confirmation…" : `Submitted on ${formatTimestamp(activeAttempt.completedAt)}`}
              </span>
            </div>
            {isEditing && <p className="small text-secondary mb-0 mt-2">Previous result saved. Submitting will update it.</p>}
          </div>
        )}
      </header>

      <div className="d-flex flex-column gap-3">
        {normalizedQuestions.map((question, questionIndex) => {
          const selectedIndex = selections[questionIndex];
          const isAnswered = selectedIndex >= 0;
          const showFeedback = !isEditing && !!activeAttempt;
          const isCorrect = showFeedback && selectedIndex === question.answerIndex;
          const questionBadgeClass = isCorrect ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary";
          const questionBadgeText = showFeedback ? (isCorrect ? "Correct" : "Needs review") : isAnswered ? "Selected" : "Not answered";

          return (
            <article key={question.id ?? `question-${questionIndex}`} className="border rounded-4 p-4 d-flex flex-column gap-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                <div className="d-flex flex-column gap-1">
                  <span className="fw-semibold">{question.question}</span>
                  <span className="badge bg-primary-subtle text-primary">{question.points} балів</span>
                </div>
                <span className={`badge ${questionBadgeClass}`}>{questionBadgeText}</span>
              </div>
              <div className="d-flex flex-column gap-2">
                {question.options.map((option, optionIndex) => {
                  const optionSelected = selectedIndex === optionIndex;
                  const optionIsCorrect = question.answerIndex === optionIndex;
                  const optionShowFeedback = showFeedback;

                  let buttonClass = "btn btn-outline-secondary text-start d-flex align-items-center gap-2";

                  if (isEditing) {
                    buttonClass = optionSelected
                      ? "btn btn-primary text-start d-flex align-items-center gap-2"
                      : "btn btn-outline-secondary text-start d-flex align-items-center gap-2";
                  } else if (optionShowFeedback && optionSelected) {
                    buttonClass = optionIsCorrect
                      ? "btn btn-outline-secondary text-start d-flex align-items-center gap-2"
                      : "btn btn-danger text-start d-flex align-items-center gap-2";
                  }

                  return (
                    <button
                      key={`${question.id}-${option}`}
                      type="button"
                      className={buttonClass}
                      onClick={() => handleSelect(questionIndex, optionIndex)}
                      disabled={!isEditing || isSubmitting}
                      aria-pressed={optionSelected}
                    >
                      <span className="badge bg-light text-secondary border">{String.fromCharCode(65 + optionIndex)}</span>
                      <span>{option}</span>
                      {!isEditing && optionShowFeedback && optionSelected && !optionIsCorrect && (
                        <span className="ms-auto badge bg-danger-subtle text-danger">Your answer</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      <footer className="d-flex flex-column gap-3">
        <div className="text-secondary small">
          {isEditing ? (
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
              <span>Answered: {answeredCount}/{normalizedQuestions.length}</span>
              <span>Complete all questions to submit the quiz.</span>
            </div>
          ) : currentScore ? (
            <div className={`alert ${currentScore.percentage >= PASSING_PERCENTAGE ? "alert-success" : "alert-warning"} mb-0`}>
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <div>
                  <strong>Result:</strong> {currentScore.scored}/{currentScore.total} pts
                  <span className="badge bg-primary-subtle text-primary ms-2">{currentScore.percentage}%</span>
                </div>
                <span className="text-secondary small">
                  {pendingAttempt && !attempt ? "Waiting for confirmation..." : formatTimestamp((attempt ?? pendingAttempt)!.completedAt)}
                </span>
              </div>
              <div className="text-secondary small mt-2">
                {currentScore.percentage >= PASSING_PERCENTAGE ? (
                  <span className="text-success fw-semibold">Great job! This quiz counts towards your progress.</span>
                ) : (
                  <span className="text-danger">You need at least 80% to pass. Retake the quiz to improve your score.</span>
                )}
              </div>
            </div>
          ) : (
            <span>Ready to submit.</span>
          )}
          {errorMessage && <div className="text-danger small mt-2">{errorMessage}</div>}
        </div>
        <div className="d-flex flex-wrap gap-2">
          {activeAttempt && !isEditing && (
            <button type="button" className="btn btn-outline-primary" onClick={startRetake} disabled={isSubmitting}>
              Retake quiz
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={submitAttempt}
            disabled={!isEditing || isSubmitting}
          >
            {isSubmitting ? "Submitting…" : "Submit answers"}
          </button>
        </div>
      </footer>
    </div>
  );
}
