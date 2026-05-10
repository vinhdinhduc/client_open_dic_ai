

const STORAGE_PREFIX = 'ai_contribution_';
const MAX_AGE_MS = 5 * 60 * 1000;


function cleanNbsp(value: string): string {
    return value.replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ');
}

function cleanData(data: ContributionData): ContributionData {
    return {
        ...data,
        term: cleanNbsp(data.term),
        definition: cleanNbsp(data.definition),
        detailedExplanation: data.detailedExplanation ? cleanNbsp(data.detailedExplanation) : undefined,
        examples: data.examples?.map(cleanNbsp),
        relatedTerms: data.relatedTerms?.map(cleanNbsp),
        tags: data.tags?.map(cleanNbsp),
    };
}

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

export interface MultiLangContributionData {

    langs: Record<string, Omit<ContributionData, 'timestamp' | 'language'>>;
    partOfSpeech?: string;
    relatedTerms?: string[];
    tags?: string[];
    timestamp: number;
}


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
        console.error(' Failed to save contribution data:', error);
        throw new Error('Storage quota exceeded or unavailable');
    }
}


export function loadContributionData(storageKey: string): ContributionData | null {
    try {
        const storedData = sessionStorage.getItem(storageKey);
        if (!storedData) {
            console.warn(' No data found for key:', storageKey);
            return null;
        }

        const parsed: ContributionData = JSON.parse(storedData);

        const age = Date.now() - parsed.timestamp;
        if (age > MAX_AGE_MS) {
            console.warn(' Contribution data expired');
            sessionStorage.removeItem(storageKey);
            return null;
        }

        return cleanData(parsed);
    } catch (error) {
        console.error(' Failed to load contribution data:', error);
        return null;
    }
}


export function clearContributionData(storageKey: string): void {
    try {
        sessionStorage.removeItem(storageKey);

    } catch (error) {
        console.error(' Failed to clear contribution data:', error);
    }
}

const ML_STORAGE_PREFIX = 'ai_ml_contribution_';


export function saveMultiLangContributionData(data: Omit<MultiLangContributionData, 'timestamp'>): string {
    const storageKey = `${ML_STORAGE_PREFIX}${Date.now()}`;
    const dataWithTimestamp: MultiLangContributionData = {
        ...data,
        timestamp: Date.now(),
    };
    try {
        sessionStorage.setItem(storageKey, JSON.stringify(dataWithTimestamp));
        return storageKey;
    } catch (error) {
        console.error(' Failed to save multi-lang contribution data:', error);
        throw new Error('Storage quota exceeded or unavailable');
    }
}



export function loadMultiLangContributionData(storageKey: string): MultiLangContributionData | null {
    try {
        const storedData = sessionStorage.getItem(storageKey);
        if (!storedData) return null;

        const parsed: MultiLangContributionData = JSON.parse(storedData);
        const age = Date.now() - parsed.timestamp;
        if (age > MAX_AGE_MS) {
            sessionStorage.removeItem(storageKey);
            return null;
        }


        for (const lang of Object.keys(parsed.langs)) {
            const entry = parsed.langs[lang];
            entry.term = cleanNbsp(entry.term);
            entry.definition = cleanNbsp(entry.definition);
            if (entry.detailedExplanation) entry.detailedExplanation = cleanNbsp(entry.detailedExplanation);
            if (entry.examples) entry.examples = entry.examples.map(cleanNbsp);
        }

        return parsed;
    } catch (error) {
        console.error(' Failed to load multi-lang contribution data:', error);
        return null;
    }
}


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
                    // Nếu parse lỗi thì xóa mục này
                    sessionStorage.removeItem(key);
                    cleanedCount++;
                }
            }
        });


    } catch (error) {
        console.error(' Failed to cleanup expired data:', error);
    }
}


export function debugStoredData(): void {
    const keys = Object.keys(sessionStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    console.log(' Stored contribution data:', {
        count: keys.length,
        keys: keys,
        data: keys.map(k => ({
            key: k,
            age: Date.now() - (JSON.parse(sessionStorage.getItem(k) || '{}').timestamp || 0),
            preview: JSON.parse(sessionStorage.getItem(k) || '{}').term,
        })),
    });
}
