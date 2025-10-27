"use client";

import { Suspense } from "react";

export function SuspenseBoundary({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="d-flex justify-content-center py-5">Loading…</div>}>{children}</Suspense>;
}
