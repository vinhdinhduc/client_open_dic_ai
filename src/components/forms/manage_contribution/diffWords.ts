export type DiffPart = {
    value: string;
    added?: boolean;
    removed?: boolean;
}

function tokenize(text: string): string[] {
    // Giữ token khoảng trắng để bảo toàn dấu cách khi gộp các phần liền kề
    return text.split(/(\s+)/).filter(token => token.length > 0);
}
export function diffWords(oldText: string, newText: string): DiffPart[] {
    const a = tokenize(oldText)
    const b = tokenize(newText)
    const m = a.length;
    const n = b.length;
    //Xây dựng bảng LCS
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            if (a[i] === b[j]) {
                dp[i][j] = dp[i + 1][j + 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1])
            }
        }
    }

    const raw: DiffPart[] = [];
    let i = 0, j = 0;
    while (i < m || j < n) {
        if (i < m && j < n && a[i] === b[j]) {
            raw.push({ value: a[i] });
            i++;
            j++;
        } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
            raw.push({ value: b[j], added: true });
            j++;
        } else {
            raw.push({ value: a[i], removed: true });
            i++;
        }
    }

    const merged: DiffPart[] = [];
    for (const part of raw) {
        const last = merged[merged.length - 1];
        if (last && Boolean(last.added) === Boolean(part.added) && Boolean(last.removed) === Boolean(part.removed)) {
            last.value += part.value
        } else {
            merged.push({ ...part })
        }
    }

    return merged;
}