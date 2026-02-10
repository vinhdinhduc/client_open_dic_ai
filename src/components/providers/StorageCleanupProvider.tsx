"use client";

import { useEffect } from "react";
import { cleanupExpiredData } from "@/utils/contributionStorage";

/**
 * Provider component to cleanup expired sessionStorage data on app initialization
 * Place this in the root layout to ensure cleanup runs once per session
 */
export default function StorageCleanupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Run cleanup on mount (app initialization)
    cleanupExpiredData();

    // Optional: Run periodic cleanup every 5 minutes
    const intervalId = setInterval(
      () => {
        cleanupExpiredData();
      },
      5 * 60 * 1000,
    );

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return <>{children}</>;
}
