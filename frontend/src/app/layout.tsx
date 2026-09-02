import './globals.css';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr">
      <body>
        <nav className="flex w-full h-full bg-amber-400">
          {children}
        </nav>
      </body>
    </html>
  );
}
