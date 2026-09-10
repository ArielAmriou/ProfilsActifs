"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContentCard } from "../layout/ContentCard";
import { useAuth } from "@/context/AuthContext";
import SurveyError from "./SurveyError";
import LoadingSurvey from "./LoadingSurvey";

export interface Question {
  id: string;
  question: string;
  type: string;
  options: string[];
  weight: number;
}

interface QuestionnaireProgress {
  currentQuestionIndex: number;
  answers: Record<string, string>;
  retaking: boolean;
}

const EMPTY_PROGRESS: QuestionnaireProgress = {
  currentQuestionIndex: 0,
  answers: {},
  retaking: false,
};

function progressStorageKey(userId: string) {
  return `profilsactifs-questionnaire-progress:${userId}`;
}

/** Reprise de session : on retrouve la question en cours si l'utilisateur quitte avant la fin. */
function readProgress(userId: string | null): QuestionnaireProgress {
  if (typeof window === "undefined" || !userId) {
    return EMPTY_PROGRESS;
  }
  try {
    const stored = localStorage.getItem(progressStorageKey(userId));
    if (!stored) {
      return EMPTY_PROGRESS;
    }
    return { ...EMPTY_PROGRESS, ...JSON.parse(stored) } as QuestionnaireProgress;
  } catch {
    return EMPTY_PROGRESS;
  }
}

function writeProgress(userId: string, progress: QuestionnaireProgress) {
  try {
    localStorage.setItem(progressStorageKey(userId), JSON.stringify(progress));
  } catch {
    // Stockage indisponible (navigation privée, quota atteint) — on ignore silencieusement.
  }
}

function clearProgress(userId: string) {
  try {
    localStorage.removeItem(progressStorageKey(userId));
  } catch {
    // ignore
  }
}

function QuestionnaireCompleted({ onRetake }: { onRetake: () => void }) {
  const router = useRouter();

  return (
    <ContentCard className="w-full max-w-2xl text-center shadow-sm">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-action/10 text-action">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7" fill="currentColor">
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </span>

      <h2 className="font-title mt-4 text-xl font-bold text-institutional">
        Questionnaire déjà complété
      </h2>
      <p className="mt-2 text-sm text-institutional/80">
        Vous avez déjà répondu à ce questionnaire et votre profil est certifié. Vous pouvez le
        refaire à tout moment si votre situation a changé.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetake}
          className="font-title rounded-full bg-action px-6 py-2.5 text-sm font-bold text-white transition hover:bg-action-hover"
        >
          Refaire le questionnaire
        </button>
        <button
          type="button"
          onClick={() => router.push("/profil")}
          className="font-title rounded-full border-2 border-border bg-surface px-6 py-2.5 text-sm font-bold text-institutional transition hover:border-institutional"
        >
          Retour à mon profil
        </button>
      </div>
    </ContentCard>
  );
}

export function Questionnaire() {
  const router = useRouter();
  const { jobseekerProfile, updateJobseekerProfile, userId } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    () => readProgress(userId).currentQuestionIndex,
  );
  const [answers, setAnswers] = useState<Record<string, string>>(
    () => readProgress(userId).answers,
  );
  const [retaking, setRetaking] = useState(() => readProgress(userId).retaking);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch("http://localhost:8081/api/certification/questions");
        const data = await response.json();
        setQuestions(data.questions || data);
      } catch (error) {
        console.error("Erreur lors du chargement des questions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  // Sauvegarde la progression (et le fait qu'on est en train de refaire le
  // questionnaire) à chaque changement, pour permettre une reprise si
  // l'utilisateur quitte la session avant d'avoir terminé.
  useEffect(() => {
    if (!userId) return;
    writeProgress(userId, { currentQuestionIndex, answers, retaking });
  }, [userId, currentQuestionIndex, answers, retaking]);

  // Garde-fou si la progression sauvegardée pointe au-delà du questionnaire actuel
  // (ex. version du questionnaire modifiée entre-temps).
  useEffect(() => {
    if (!loading && questions.length > 0 && currentQuestionIndex > questions.length - 1) {
      setCurrentQuestionIndex(questions.length - 1);
    }
  }, [loading, questions, currentQuestionIndex]);

  if (jobseekerProfile.certified && !retaking) {
    return (
      <QuestionnaireCompleted
        onRetake={() => {
          setAnswers({});
          setCurrentQuestionIndex(0);
          setRetaking(true);
        }}
      />
    );
  }

  if (loading) {
    return <LoadingSurvey />;
  }
  if (!questions || questions.length === 0) {
    return <SurveyError />;
  }

  const currentQuestionData = questions[currentQuestionIndex];

  if (!currentQuestionData) {
    return null;
  }

  const TOTAL_QUESTIONS = questions.length;
  const progress = ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const availability = answers["4"] ?? "";
      void updateJobseekerProfile({ certified: true, availability });
      if (userId) clearProgress(userId);
      router.push("/profil");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  return (
    <ContentCard className="w-full max-w-2xl shadow-sm">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-title text-sm font-bold text-institutional">
            Question {currentQuestionIndex + 1} sur {TOTAL_QUESTIONS}
          </span>
          <span className="font-title text-sm font-bold text-action">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-action transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="min-h-62.5">
        <div>
          <h2 className="font-title mb-6 text-xl font-bold text-institutional">
            {currentQuestionData.question}
          </h2>
        </div>

        <div className="space-y-3">
          {currentQuestionData.options?.map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                answers[currentQuestionData.id] === option
                  ? "border-action bg-action/5"
                  : "border-border hover:border-institutional/30"
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestionData.id}`}
                value={option}
                checked={answers[currentQuestionData.id] === option}
                onChange={(e) =>
                  setAnswers({
                    ...answers,
                    [currentQuestionData.id]: e.target.value,
                  })
                }
                className="size-5 text-action accent-action"
              />
              <span className="font-title font-medium text-institutional">
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="font-title rounded-full border-2 border-border bg-surface px-6 py-2.5 text-sm font-bold text-institutional transition enabled:hover:border-institutional disabled:opacity-50"
        >
          Précédent
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/profil")}
            className="font-title rounded-full border-2 border-border bg-surface px-6 py-2.5 text-sm font-bold text-institutional transition hover:border-institutional"
          >
            Plus tard
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!answers[currentQuestionData.id]}
            className="font-title rounded-full bg-action px-6 py-2.5 text-sm font-bold text-white transition enabled:hover:bg-action-hover disabled:opacity-50"
          >
            {currentQuestionIndex === TOTAL_QUESTIONS - 1 ? "Terminer" : "Suivant"}
          </button>
        </div>
      </div>
    </ContentCard>
  );
}