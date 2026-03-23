"use client";

import React, { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
  inline = false,
}) => {
  if (!content || typeof content !== "string") {
    return null;
  }

  let cleanedContent = content
    .replace(/^```(?:json|markdown|md|text)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();

  if (inline) {
    cleanedContent = cleanedContent
      .replace(/\n\n+/g, " ")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ");
  }

  const customComponents = {
    p: ({ children }: { children: ReactNode }) => (
      <p style={{ margin: "0.5rem 0", lineHeight: "1.5" }}>{children}</p>
    ),
    ul: ({ children }: { children: ReactNode }) => (
      <ul
        style={{
          margin: "0.5rem 0",
          paddingLeft: "1.5rem",
          lineHeight: "1.6",
        }}
      >
        {children}
      </ul>
    ),
    ol: ({ children }: { children: ReactNode }) => (
      <ol
        style={{
          margin: "0.5rem 0",
          paddingLeft: "1.5rem",
          lineHeight: "1.6",
        }}
      >
        {children}
      </ol>
    ),
    li: ({ children }: { children: ReactNode }) => (
      <li style={{ margin: "0.25rem 0" }}>{children}</li>
    ),
    h1: ({ children }: { children: ReactNode }) => (
      <h1 style={{ fontSize: "1.5rem", margin: "0.5rem 0", fontWeight: 600 }}>
        {children}
      </h1>
    ),
    h2: ({ children }: { children: ReactNode }) => (
      <h2 style={{ fontSize: "1.25rem", margin: "0.5rem 0", fontWeight: 600 }}>
        {children}
      </h2>
    ),
    h3: ({ children }: { children: ReactNode }) => (
      <h3 style={{ fontSize: "1.1rem", margin: "0.5rem 0", fontWeight: 600 }}>
        {children}
      </h3>
    ),
    code: ({ children }: { children: ReactNode }) => (
      <code
        style={{
          backgroundColor: "#f0f0f0",
          padding: "0.2rem 0.4rem",
          borderRadius: "3px",
          fontFamily: "monospace",
          fontSize: "0.9em",
        }}
      >
        {children}
      </code>
    ),
    strong: ({ children }: { children: ReactNode }) => (
      <strong style={{ fontWeight: 600 }}>{children}</strong>
    ),
    em: ({ children }: { children: ReactNode }) => (
      <em style={{ fontStyle: "italic" }}>{children}</em>
    ),
  };

  return (
    <div className={`markdown-renderer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={customComponents as any}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
