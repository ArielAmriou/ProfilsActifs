import { Alert } from "@heroui/react";

export default function SurveyError()
{
  return (
    <Alert status="danger" className="max-w-125 justify-center">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Aucune question disponible</Alert.Title>
        <Alert.Description>
          Nous rencontrons actuellement des problèmes de connexion. Veuillez essayer ce qui suit :
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            <li>Vérifiez votre connexion internet</li>
            <li>Rafraîchissez votre page</li>
            <li>Nettoyez le cache de votre navigateur</li>
          </ul>
        </Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
