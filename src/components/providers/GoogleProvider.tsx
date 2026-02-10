"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

interface GoogleProviderProps {
  children: React.ReactNode;
}

export default function GoogleProvider({ children }: GoogleProviderProps) {
  if (!GOOGLE_CLIENT_ID) {
    // If no Google Client ID configured, render children without the provider
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
