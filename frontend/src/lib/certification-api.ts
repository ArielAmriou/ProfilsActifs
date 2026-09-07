const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function fetchCertificationQuestions()
{
  const response = await fetch(`${apiUrl}/api/certification/questions`);
  
  if (!response.ok)
    throw new Error("Impossible de récupérer le questionnaire");
  return response.json();
}
