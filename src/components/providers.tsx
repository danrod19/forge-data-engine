"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { TrackProvider } from "@/lib/track-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TrackProvider>{children}</TrackProvider>
    </AuthProvider>
  );
}
