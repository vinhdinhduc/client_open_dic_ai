/**
 * Utility functions for managing AI-to-Contribution data transfer
 * Uses sessionStorage for optimal performance and avoiding URL length limits
 */

const STORAGE_PREFIX = 'ai_contribution_';
const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

export interface ContributionData {
    term: string;
    definition: string;
    detailedExplanation?: string;
    examples?: string[];
    partOfSpeech?: string;
    field?: string;
    relatedTerms?: string[];
    tags?: string[];
    language?: string;
    timestamp: number;
}

/**
 * Save contribution data to sessionStorage
 * @returns Storage key to be passed via URL
 */
export function saveContributionData(data: Omit<ContributionData, 'timestamp'>): string {
    const storageKey = `${STORAGE_PREFIX}${Date.now()}`;
    const dataWithTimestamp: ContributionData = {
        ...data,
        timestamp: Date.now(),
    };

    try {
        sessionStorage.setItem(storageKey, JSON.stringify(dataWithTimestamp));
        return storageKey;
    } catch (error) {
        console.error('❌ Failed to save contribution data:', error);
        throw new Error('Storage quota exceeded or unavailable');
    }
}

/**
 * Load contribution data from sessionStorage
 * @returns Data if valid and not expired, null otherwise
 */
export function loadContributionData(storageKey: string): ContributionData | null {
    try {
        const storedData = sessionStorage.getItem(storageKey);
        if (!storedData) {
            console.warn('⚠️ No data found for key:', storageKey);
            return null;
        }

        const parsed: ContributionData = JSON.parse(storedData);

        // Validate freshness
        const age = Date.now() - parsed.timestamp;
        if (age > MAX_AGE_MS) {
            console.warn('⚠️ Contribution data expired');
            sessionStorage.removeItem(storageKey);
            return null;
        }

        return parsed;
    } catch (error) {
        console.error('❌ Failed to load contribution data:', error);
        return null;
    }
}

/**
 * Remove contribution data after use
 */
export function clearContributionData(storageKey: string): void {
    try {
        sessionStorage.removeItem(storageKey);

    } catch (error) {
        console.error('❌ Failed to clear contribution data:', error);
    }
}

/**
 * Clean up all expired contribution data
 * Should be called on app initialization
 */
export function cleanupExpiredData(): void {
    try {
        const keys = Object.keys(sessionStorage);
        let cleanedCount = 0;

        keys.forEach((key) => {
            if (key.startsWith(STORAGE_PREFIX)) {
                try {
                    const data = sessionStorage.getItem(key);
                    if (data) {
                        const parsed = JSON.parse(data);
                        const age = Date.now() - (parsed.timestamp || 0);

                        if (age > MAX_AGE_MS) {
                            sessionStorage.removeItem(key);
                            cleanedCount++;
                        }
                    }
                } catch {
                    // If parsing fails, remove the item
                    sessionStorage.removeItem(key);
                    cleanedCount++;
                }
            }
        });

        // Cleaned up expired items silently
    } catch (error) {
        console.error('❌ Failed to cleanup expired data:', error);
    }
}

/**
 * Get all stored contribution data (for debugging)
 */
export function debugStoredData(): void {
    const keys = Object.keys(sessionStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    console.log('📦 Stored contribution data:', {
        count: keys.length,
        keys: keys,
        data: keys.map(k => ({
            key: k,
            age: Date.now() - (JSON.parse(sessionStorage.getItem(k) || '{}').timestamp || 0),
            preview: JSON.parse(sessionStorage.getItem(k) || '{}').term,
        })),
    });
}
