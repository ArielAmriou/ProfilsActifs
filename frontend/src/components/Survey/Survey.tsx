"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContentCard } from "../layout/ContentCard";
import { useAuth } from "@/context/AuthContext";
import { questions, type QuestionType } from "./Questions";


function ProgressBar({currentQuestionIndex, progress, totalQuestions}: {currentQuestionIndex: number, progress: number, totalQuestions: number}) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-title text-sm font-bold text-institutional">
          Question {currentQuestionIndex + 1} sur {totalQuestions}
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
  )
}

function QuestionName({currentQuestionData} : {currentQuestionData: QuestionType})
{
  return (
    <div>
      <h2 className="font-title mb-2 text-xl font-bold text-institutional">
        {currentQuestionData.intitulé}
      </h2>
      <p className="mb-6 text-sm text-institutional/80">
        {currentQuestionData.content}
      </p>
    </div>
  )
}

export function Questionnaire() {
  const router = useRouter();
  const { updateJobseekerProfile } = useAuth(); 
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const TOTAL_QUESTIONS = questions.length;
  const currentQuestionData = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      updateJobseekerProfile({ certified: true }); 
      router.push("/profil");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  if (!currentQuestionData)
    return null;

  return (
    <ContentCard className="w-full max-w-2xl shadow-sm">
      <ProgressBar 
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={TOTAL_QUESTIONS}
        progress={progress}
      />
      <div className="min-h-62.5">
        <QuestionName currentQuestionData={currentQuestionData}/>

        <div className="space-y-3">
          {currentQuestionData.options.map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                answers[currentQuestionData.noq] === option
                  ? "border-action bg-action/5"
                  : "border-border hover:border-institutional/30"
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestionData.noq}`}
                value={option}
                checked={answers[currentQuestionData.noq] === option}
                onChange={(e) =>
                  setAnswers({
                    ...answers,
                    [currentQuestionData.noq]: e.target.value,
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
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="font-title rounded-full border-2 border-border bg-surface px-6 py-2.5 text-sm font-bold text-institutional transition enabled:hover:border-institutional disabled:opacity-50"
        >
          Précédent
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/profil")} 
            className="font-title rounded-full border-2 border-border bg-surface px-6 py-2.5 text-sm font-bold text-institutional transition hover:border-institutional"
          >
            Plus tard
          </button>
          
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestionData.noq]}
            className="font-title rounded-full bg-action px-6 py-2.5 text-sm font-bold text-white transition enabled:hover:bg-action-hover disabled:opacity-50"
          >
            {currentQuestionIndex === TOTAL_QUESTIONS - 1 ? "Terminer" : "Suivant"}
          </button>
        </div>
      </div>
    </ContentCard>
  );
}
