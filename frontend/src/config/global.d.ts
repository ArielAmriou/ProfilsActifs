import { ReactNode } from 'react';

declare global {
  type LayoutProps<T = unknown> = {
    children: ReactNode;
    params?: Promise<T>;
  };

  type PageProps<T = unknown> = {
    params?: Promise<T>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  };
}
