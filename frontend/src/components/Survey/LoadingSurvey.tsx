import { Card } from "@heroui/react";

export default function LoadingSurvey()
{
  return (
    <Card className="w-full max-w-2xl shadow-sm text-center py-10">
      <p className="font-title text-institutional">Chargement du questionnaire...</p>
    </Card>
  );
}