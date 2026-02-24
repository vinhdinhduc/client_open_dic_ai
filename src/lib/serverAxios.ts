

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface FetchOptions extends RequestInit {
    timeout?: number;
}

export async function serverFetch<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const { timeout = 10000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                ...fetchOptions.headers,
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Search terms on server side
 */
export async function searchTermsServer(
    query: string,
    language: string = "vi"
): Promise<{
    success: boolean;
    data: {
        terms: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}> {
    try {
        const params = new URLSearchParams({
            q: query,
            language,
        });

        const result = await serverFetch<{
            success: boolean;
            data: {
                terms: any[];
                pagination: {
                    page: number;
                    limit: number;
                    total: number;
                    pages: number;
                };
            };
        }>(`/terms/search?${params.toString()}`, {
            next: { revalidate: 60 },
        });


        return result;
    } catch (error) {
        console.error("Error searching terms on server:", error);
        return {
            success: false,
            data: {
                terms: [],
                pagination: { page: 1, limit: 10, total: 0, pages: 0 },
            },
        };
    }
}
