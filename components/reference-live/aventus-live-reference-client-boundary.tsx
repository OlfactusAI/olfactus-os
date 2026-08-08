"use client";

import { useEffect, useState } from "react";
import {
  AventusLiveReference,
} from "@/components/reference-live/aventus-live-reference";
import {
  Gs000001NativeRuntimeBootstrap,
} from "@/components/reference-live/gs000001-native-runtime-bootstrap";

/**
 * The live-reference trace is backed by browser localStorage.
 *
 * Client Components are still pre-rendered by Next.js on the server, where
 * localStorage is unavailable. Rendering AventusLiveReference before mount can
 * therefore produce BLOCKED on the server and RUNTIME ACTIVE on the browser,
 * which causes a hydration mismatch.
 *
 * Keep the server output and the browser's first render identical, then render
 * the real live-reference UI only after hydration has completed.
 */
export function AventusLiveReferenceClientBoundary() {
  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-busy="true"
        className="min-h-[240px]"
      />
    );
  }

  return (
    <>
      <Gs000001NativeRuntimeBootstrap />
      <AventusLiveReference />
    </>
  );
}
