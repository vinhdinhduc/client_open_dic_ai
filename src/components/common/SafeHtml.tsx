"use client";

import React from "react";
import { sanitizeHtml, containsHtml } from "@/utils/safeHtml";

interface SafeHtmlProps {
  content: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Safely renders HTML content (e.g. from Quill rich-text editor).
 * Falls back to plain text rendering when no HTML tags are present.
 */
export default function SafeHtml({
  content,
  className,
  as: Tag = "div",
}: SafeHtmlProps) {
  if (!content) return null;

  if (containsHtml(content)) {
    const sanitized = sanitizeHtml(content);
    return (
      <Tag
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  return <Tag className={className}>{content}</Tag>;
}
