"use client";

import { useMemo, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { HeaderBar } from "@/components/HeaderBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { RequireRole } from "@/components/RequireRole";
import { ContentCard } from "@/components/layout/ContentCard";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  buildMockQcmQuestions,
  TOTAL_QUESTIONS,
  VISIBLE_MOCK_COUNT,
  type QcmQuestion,
} from "@/data/questionnaire";

function QcmStep({
  question,
  stepIndex,
  totalSteps,
  selectedOption,
  onSelect,
  onValidate,
  onPrevious,
  canGoBack,
}: {
  question: QcmQuestion;
  stepIndex: number;
  totalSteps: number;
  selectedOption: string | undefined;
  onSelect: (option: string) => void;
  onValidate: () => void;
  onPrevious: () => void;
  canGoBack: boolean;
}) {
  return (
    <div>
      <p className="font-title text-xs font-bold uppercase tracking-wide text-institutional/60">
        Question {stepIndex + 1} sur {totalSteps}
      </p>

      <fieldset className="mt-4 rounded-xl border-2 border-border bg-surface p-5">
        <legend className="font-title mb-4 block text-base font-bold text-institutional">
          {question.text.replace(/^Question \d+ — /, "")}
        </legend>
        <div className="space-y-2">
          {question.options.map((option) => {
            const selected = selectedOption === option;
            const inputId = `q-${question.id}-${option.replace(/\s+/g, "-").toLowerCase()}`;

            return (
              <label
                key={option}
                htmlFor={inputId}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 transition ${
                  selected
                    ? "border-action bg-action/5"
                    : "border-border bg-content-bg hover:border-institutional/30"
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={selected}
                  onChange={() => onSelect(option)}
                  className="size-4 shrink-0 accent-action"
                />
                <span className="text-sm text-institutional">{option}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoBack}
          className="font-title rounded-lg border-2 border-border px-4 py-3 text-sm font-bold text-institutional transition enabled:hover:border-institutional disabled:cursor-not-allowed disabled:opacity-40"
        >
          Question précédente
        </button>
        <button
          type="button"
          onClick={onValidate}
          disabled={!selectedOption}
          className="font-title rounded-lg bg-action px-4 py-3 text-sm font-bold text-white transition enabled:hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-action/50"
        >
          Valider et continuer
        </button>
      </div>
    </div>
  );
}

export default function QuestionnairePage() {
  const questions = useMemo(() => buildMockQcmQuestions(VISIBLE_MOCK_COUNT), []);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [validatedCount, setValidatedCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pendingSelection, setPendingSelection] = useState<string | undefined>();
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = Math.round((validatedCount / TOTAL_QUESTIONS) * 100);

  const handleSelect = (option: string) => {
    setPendingSelection(option);
  };

  const handleValidate = () => {
    if (!currentQuestion || !pendingSelection) {
      return;
    }

    const alreadyValidated = currentQuestion.id in answers;

    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: pendingSelection,
    }));

    if (!alreadyValidated) {
      setValidatedCount((count) => count + 1);
    }

    if (currentIndex >= questions.length - 1) {
      setIsComplete(true);
      return;
    }

    const nextQuestion = questions[currentIndex + 1];
    setCurrentIndex((index) => index + 1);
    setPendingSelection(nextQuestion ? answers[nextQuestion.id] : undefined);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsComplete(false);
      const previousIndex = currentIndex - 1;
      const previousQuestion = questions[previousIndex];
      setCurrentIndex(previousIndex);
      setPendingSelection(
        previousQuestion ? answers[previousQuestion.id] : undefined,
      );
    }
  };

  return (
    <>
      <PageLayout hideSidebarOnMobile sidebar={<AppSidebar />}>
        <RequireRole allowed={["demandeur"]}>
          <HeaderBar />
          <div className="flex flex-1 flex-col px-6 py-10 lg:px-10">
            <ContentCard className="w-full max-w-3xl">
              <h1 className="font-title text-2xl font-bold text-institutional">
                Questionnaire
              </h1>
              <p className="mt-2 text-sm text-institutional/80">
                Répondez aux questions une par une. Choisissez une réponse, validez,
                puis passez à la suivante.
              </p>

              <div className="mt-6 rounded-xl border-2 border-border bg-content-bg p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-title text-sm font-bold text-institutional">
                    Progression : {validatedCount} / {TOTAL_QUESTIONS}
                  </p>
                  <p className="font-title text-sm font-bold text-action">{progress} %</p>
                </div>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-surface"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progression du questionnaire"
                >
                  <div
                    className="h-full rounded-full bg-action transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {isComplete ? (
                <div className="mt-8 rounded-xl border-2 border-border bg-content-bg px-6 py-10 text-center">
                  <h2 className="font-title text-xl font-bold text-institutional">
                    Maquette terminée
                  </h2>
                  <p className="mt-3 text-sm text-institutional/80">
                    Vous avez validé les {VISIBLE_MOCK_COUNT} premières questions.
                    Les questions {VISIBLE_MOCK_COUNT + 1} à {TOTAL_QUESTIONS} seront
                    disponibles prochainement.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsComplete(false);
                      setCurrentIndex(questions.length - 1);
                      const lastQuestion = questions[questions.length - 1];
                      setPendingSelection(
                        lastQuestion ? answers[lastQuestion.id] : undefined,
                      );
                    }}
                    className="font-title mt-6 rounded-lg border-2 border-border px-4 py-3 text-sm font-bold text-institutional transition hover:border-institutional"
                  >
                    Revoir la dernière question
                  </button>
                </div>
              ) : (
                currentQuestion && (
                  <div className="mt-8">
                    <QcmStep
                      question={currentQuestion}
                      stepIndex={currentIndex}
                      totalSteps={questions.length}
                      selectedOption={pendingSelection}
                      onSelect={handleSelect}
                      onValidate={handleValidate}
                      onPrevious={handlePrevious}
                      canGoBack={currentIndex > 0}
                    />
                  </div>
                )
              )}

              {!isComplete && (
                <p className="mt-8 text-xs text-institutional/65">
                  Maquette : {VISIBLE_MOCK_COUNT} questions disponibles sur{" "}
                  {TOTAL_QUESTIONS}.
                </p>
              )}
            </ContentCard>
          </div>
        </RequireRole>
      </PageLayout>
      <MobileBottomNav />
    </>
  );
}
