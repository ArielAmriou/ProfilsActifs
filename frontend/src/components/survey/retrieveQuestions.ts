import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { Question } from "./Survey";

export default function retrieveQuestions(
  setQuestions: Dispatch<SetStateAction<Question[]>>,
  setLoading: Dispatch<SetStateAction<boolean>>
)
{
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
        const response = await fetch(`${apiUrl}/api/certification/questions`);
        console.debug(response);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des questions");
        }
        const data = await response.json();
        setQuestions(data.questions);
        console.debug(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);
}
