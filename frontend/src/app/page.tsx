"use client";

import { Button } from "@heroui/react";

export function MonComposant() {
  return (
    <Button variant="primary">
      Next.js est configuré !
    </Button>
  );
}
export default function Page() {
    return (
        <nav>
            <MonComposant/>
        </nav>
    );
}