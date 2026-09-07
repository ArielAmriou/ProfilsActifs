"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContentCard } from "../layout/ContentCard";
import { useAuth } from "@/context/AuthContext";

interface Question {
  id: string;
  question: string;
  type: string;
  options: string[];
  weight: number;
}

// export function Questionnaire()
// {
//   // const router = useRouter();
//   // const { updateJobseekerProfile } = useAuth();

//   // const [questions, setQuestions] = useState<Question[]>([]);
//   // const [loading, setLoading] = useState(true);
//   // const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   // const [answers, setAnswers] = useState<Record<string, string>>({});

//   // useEffect(() => {
//   //   async function fetchQuestions() {
//   //     try {
//   //       const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
//   //       const response = await fetch(`${apiUrl}/api/certification/questions`);
//   //       if (!response.ok) {
//   //         throw new Error("Erreur lors de la récupération des questions");
//   //       }
//   //       const data = await response.json();
//   //       setQuestions(data.questions);
//   //     } catch (error) {
//   //       console.error(error);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   }

//   //   fetchQuestions();
//   // }, []);

//   // if (loading) {
//   //   return (
//   //     <ContentCard className="w-full max-w-2xl shadow-sm text-center py-10">
//   //       <p className="font-title text-institutional">Chargement du questionnaire...</p>
//   //     </ContentCard>
//   //   );
//   // }

//   // if (!questions || questions.length === 0) {
//   //   return (
//   //     <ContentCard className="w-full max-w-2xl shadow-sm text-center py-10">
//   //       <p className="font-title text-institutional">Aucune question disponible.</p>
//   //     </ContentCard>
//   //   );
//   // }

//   // const currentQuestionData = questions[currentQuestionIndex];

//   // if (!currentQuestionData) {
//   //   return null;
//   // }

//   // const TOTAL_QUESTIONS = questions.length;
//   // const progress = ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;

//   // const handleNext = () => {
//   //   if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
//   //     setCurrentQuestionIndex((prev) => prev + 1);
//   //   } else {
//   //     updateJobseekerProfile({ certified: true });
//   //     router.push("/profil");
//   //   }
//   // };

//   // const handlePrevious = () => {
//   //   if (currentQuestionIndex > 0) {
//   //     setCurrentQuestionIndex((prev) => prev - 1);
//   //   }
//   // };

//   // return (
//   //   <ContentCard className="w-full max-w-2xl shadow-sm">
//   //     <div className="mb-8">
//   //       <div className="mb-2 flex items-center justify-between">
//   //         <span className="font-title text-sm font-bold text-institutional">
//   //           Question {currentQuestionIndex + 1} sur {TOTAL_QUESTIONS}
//   //         </span>
//   //         <span className="font-title text-sm font-bold text-action">
//   //           {Math.round(progress)}%
//   //         </span>
//   //       </div>
//   //       <div className="h-3 w-full overflow-hidden rounded-full bg-border">
//   //         <div
//   //           className="h-full bg-action transition-all duration-300 ease-out"
//   //           style={{ width: `${progress}%` }}
//   //         />
//   //       </div>
//   //     </div>

//   //     <div className="min-h-62.5">
//   //       <div>
//   //         <h2 className="font-title mb-6 text-xl font-bold text-institutional">
//   //           {currentQuestionData.question}
//   //         </h2>
//   //       </div>

//   //       <div className="space-y-3">
//   //         {currentQuestionData.options.map((option) => (
//   //           <label
//   //             key={option}
//   //             className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
//   //               answers[currentQuestionData.id] === option
//   //                 ? "border-action bg-action/5"
//   //                 : "border-border hover:border-institutional/30"
//   //             }`}
//   //           >
//   //             <input
//   //               type="radio"
//   //               name={`question-${currentQuestionData.id}`}
//   //               value={option}
//   //               checked={answers[currentQuestionData.id] === option}
//   //               onChange={(e) =>
//   //                 setAnswers({
//   //                   ...answers,
//   //                   [currentQuestionData.id]: e.target.value,
//   //                 })
//   //               }
//   //               className="size-5 text-action accent-action"
//   //             />
//   //             <span className="font-title font-medium text-institutional">
//   //               {option}
//   //             </span>
//   //           </label>
//   //         ))}
//   //       </div>
//   //     </div>

//   //     <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
//   //       <button
//   //         type="button"
//   //         onClick={handlePrevious}
//   //         disabled={currentQuestionIndex === 0}
//   //         className="font-title rounded-full border-2 border-border bg-surface px-6 py-2.5 text-sm font-bold text-institutional transition enabled:hover:border-institutional disabled:opacity-50"
//   //       >
//   //         Précédent
//   //       </button>

//   //       <div className="flex items-center gap-3">
//   //         <button
//   //           type="button"
//   //           onClick={() => router.push("/profil")}
//   //           className="font-title rounded-full border-2 border-border bg-surface px-6 py-2.5 text-sm font-bold text-institutional transition hover:border-institutional"
//   //         >
//   //           Plus tard
//   //         </button>

//   //         <button
//   //           type="button"
//   //           onClick={handleNext}
//   //           disabled={!answers[currentQuestionData.id]}
//   //           className="font-title rounded-full bg-action px-6 py-2.5 text-sm font-bold text-white transition enabled:hover:bg-action-hover disabled:opacity-50"
//   //         >
//   //           {currentQuestionIndex === TOTAL_QUESTIONS - 1 ? "Terminer" : "Suivant"}
//   //         </button>
//   //       </div>
//   //     </div>
//   //   </ContentCard>
//   // );
//   return (
//       <Card className="w-[320px]" variant="default">
//         <Card.Header>
//           <Card.Title>Default</Card.Title>
//           <Card.Description>Standard card appearance (bg-surface)</Card.Description>
//         </Card.Header>
//         <Card.Content>
//           <p>The default card variant for most use cases</p>
//         </Card.Content>
//       </Card>
//   )
// }


import { Card } from "@heroui/react";

export function Questionnaire()
{
  const { updateJobseekerProfile } = useAuth();
  const router = useRouter();

  return (
    <Card className="w-[320px]" variant="default">
      <Card.Header>
        <Card.Title>Default</Card.Title>
        <Card.Description>Standard card appearance (bg-surface)</Card.Description>
      </Card.Header>
      <Card.Content>
        <p>The default card variant for most use cases</p>
      </Card.Content>
    </Card>
  );
}