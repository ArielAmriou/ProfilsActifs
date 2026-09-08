import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Section Administrateur",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
