import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProfilsActifs",
  description:
    "ProfilsActifs met en avant les compétences des demandeurs d'emploi par la vidéo.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <a href="#contenu-principal" className="skip-link">
          Aller au contenu principal
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
