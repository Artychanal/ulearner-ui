"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { QuizAttempt, QuizContent } from "@/types/course";

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

function buildBlankSelection(length: number) {
  return Array.from({ length }, () => -1);
}

function formatTimestamp(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function QuizRunner({ quiz, attempt, onSubmit }: QuizRunnerProps) {
  const [selections, setSelections] = useState<number[]>(() =>
    attempt ? [...attempt.selectedOptionIndexes] : buildBlankSelection(quiz.questions.length),
  );
  const [isEditing, setIsEditing] = useState<boolean>(() => !attempt);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!attempt) {
      setSelections(buildBlankSelection(quiz.questions.length));
      setIsEditing(true);
      return;
    }
    setSelections([...attempt.selectedOptionIndexes]);
    setIsEditing(false);
  }, [attempt, quiz.questions.length]);

  const answeredCount = useMemo(() => selections.filter((index) => index >= 0).length, [selections]);
  const allAnswered = answeredCount === quiz.questions.length;

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

  const currentScore = useMemo(() => {
    if (!attempt) {
      return null;
    }
    return {
      scored: attempt.scoredPoints,
      total: attempt.totalPoints,
      percentage: attempt.totalPoints ? Math.round((attempt.scoredPoints / attempt.totalPoints) * 100) : 0,
    };
  }, [attempt]);

  const submitAttempt = useCallback(async () => {
    if (!isEditing || isSubmitting) {
      return;
    }

    if (!allAnswered) {
      setErrorMessage("Відповідай на всі питання, перш ніж надсилати вікторину.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    const scoredPoints = quiz.questions.reduce((total, question, index) => {
      const selectedIndex = selections[index];
      return selectedIndex === question.answerIndex ? total + question.points : total;
    }, 0);

    try {
      await onSubmit({
        selectedOptionIndexes: selections,
        scoredPoints,
        totalPoints: quiz.totalPoints,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [allAnswered, isEditing, isSubmitting, onSubmit, quiz.questions, quiz.totalPoints, selections]);

  const startRetake = useCallback(() => {
    if (!attempt) {
      return;
    }
    setIsEditing(true);
    setErrorMessage(null);
  }, [attempt]);

  return (
    <div className="d-flex flex-column gap-4">
      <header className="d-flex flex-column gap-2">
        <h2 className="h4 fw-semibold mb-0">{quiz.title}</h2>
        <p className="text-secondary small mb-0">Вікторина на {quiz.totalPoints} балів</p>
        {attempt && (
          <div className={`alert ${currentScore && currentScore.percentage === 100 ? "alert-success" : "alert-info"} mb-0`}>
            <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
              <span>
                Останній результат: <strong>{attempt.scoredPoints}</strong> з {attempt.totalPoints} балів
                {currentScore && (
                  <span className="ms-2 badge bg-primary-subtle text-primary">{currentScore.percentage}%</span>
                )}
              </span>
              <span className="text-secondary small">Спроба від {formatTimestamp(attempt.completedAt)}</span>
            </div>
            {isEditing && <p className="small text-secondary mb-0 mt-2">Попередній результат збережено. Після надсилання він оновиться.</p>}
          </div>
        )}
      </header>

      <div className="d-flex flex-column gap-3">
        {quiz.questions.map((question, questionIndex) => {
          const selectedIndex = selections[questionIndex];
          const isAnswered = selectedIndex >= 0;
          const showFeedback = !isEditing && !!attempt;
          const isCorrect = showFeedback && selectedIndex === question.answerIndex;
          const questionBadgeClass = isCorrect ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary";
          const questionBadgeText = showFeedback ? (isCorrect ? "Вірно" : "Невірно") : isAnswered ? "Вибрано" : "Не відповіли";

          return (
            <article key={question.id} className="border rounded-4 p-4 d-flex flex-column gap-3">
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
                  } else if (optionShowFeedback) {
                    if (optionSelected && optionIsCorrect) {
                      buttonClass = "btn btn-success text-start d-flex align-items-center gap-2";
                    } else if (optionSelected && !optionIsCorrect) {
                      buttonClass = "btn btn-danger text-start d-flex align-items-center gap-2";
                    } else if (!optionSelected && optionIsCorrect) {
                      buttonClass = "btn btn-outline-success text-start d-flex align-items-center gap-2";
                    } else {
                      buttonClass = "btn btn-outline-secondary text-start d-flex align-items-center gap-2";
                    }
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
                      {!isEditing && optionShowFeedback && optionIsCorrect && (
                        <span className="ms-auto badge bg-success-subtle text-success">Правильна відповідь</span>
                      )}
                      {!isEditing && optionShowFeedback && optionSelected && !optionIsCorrect && (
                        <span className="ms-auto badge bg-danger-subtle text-danger">Твоя відповідь</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      <footer className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div className="text-secondary small">
          {isEditing ? (
            <span>
              Пройдено питань: {answeredCount}/{quiz.questions.length}
            </span>
          ) : attempt ? (
            <span>
              Поточний результат: {attempt.scoredPoints}/{attempt.totalPoints} балів
            </span>
          ) : (
            <span>Готово до перевірки</span>
          )}
          {errorMessage && <div className="text-danger small mt-2">{errorMessage}</div>}
        </div>
        <div className="d-flex gap-2">
          {attempt && !isEditing && (
            <button type="button" className="btn btn-outline-primary" onClick={startRetake} disabled={isSubmitting}>
              Перепройти вікторину
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={submitAttempt}
            disabled={!isEditing || isSubmitting}
          >
            {isSubmitting ? "Надсилання..." : "Надіслати відповіді"}
          </button>
        </div>
      </footer>
    </div>
  );
}
