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
