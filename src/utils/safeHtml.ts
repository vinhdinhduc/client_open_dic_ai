/**
 * Sanitize HTML to prevent XSS attacks.
 * Strips dangerous tags/attributes while preserving safe Quill-generated HTML.
 * Note: Backend already sanitizes with XSS library; this is an extra client-side layer.
 */
const DANGEROUS_TAGS = /<(script|style|iframe|object|embed|base|form|input|button|select|textarea|link|meta)[^>]*>[\s\S]*?<\/\1>/gi;
const DANGEROUS_SELF_CLOSE = /<(script|style|iframe|object|embed|base|form|input|button|select|textarea|link|meta)[^/]*\/?\s*>/gi;
const EVENT_HANDLERS = /\s(on\w+)\s*=\s*["'][^"']*["']/gi;
const JAVASCRIPT_HREF = /href\s*=\s*["']\s*javascript:[^"']*["']/gi;
const DATA_URI = /src\s*=\s*["']\s*data:[^"']*["']/gi;

export function sanitizeHtml(html: string): string {
    if (!html) return "";
    return html
        .replace(DANGEROUS_TAGS, "")
        .replace(DANGEROUS_SELF_CLOSE, "")
        .replace(EVENT_HANDLERS, "")
        .replace(JAVASCRIPT_HREF, 'href="#"')
        .replace(DATA_URI, 'src=""');
}

/** Check if a string contains HTML tags */
export function containsHtml(str: string): boolean {
    return /<[a-z][\s\S]*>/i.test(str);
}

/** Convert rich HTML to readable plain text for preview cards and search snippets. */
export function toPlainText(content: string): string {
    if (!content) return "";

    const sanitized = sanitizeHtml(content)
        .replace(/<br\s*\/?\s*>/gi, "\n")
        .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, "\n")
        .replace(/<li[^>]*>/gi, "- ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'");

    return sanitized
        .replace(/\s+\n/g, "\n")
        .replace(/\n\s+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
}
