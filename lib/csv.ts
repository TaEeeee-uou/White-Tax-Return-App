// lib/csv.ts
// CSV エクスポート・インポートのヘルパー関数

/**
 * JSON配列をCSV文字列に変換してファイルダウンロードする
 * UTF-8 BOM付き（Excelで文字化けしないよう対応）
 */
export function exportToCSV(headers: string[], records: any[], filename: string): void {
    const escape = (val: any): string => {
        const str = val === undefined || val === null ? '' : String(val);
        // カンマ・改行・ダブルクォートを含む場合はダブルクォートで囲む
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const headerRow = headers.map(escape).join(',');
    const dataRows = records.map(record =>
        headers.map(h => escape(record[h])).join(',')
    );

    const csvContent = [headerRow, ...dataRows].join('\r\n');

    // UTF-8 BOM付きでBlob生成
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * CSV文字列をJSON配列に変換する
 * 1行目はヘッダーとして扱う
 */
export function parseCSV(text: string): { headers: string[]; records: any[] } {
    // BOMを除去
    const cleaned = text.replace(/^\uFEFF/, '');
    const lines = cleaned.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length < 2) {
        return { headers: [], records: [] };
    }

    const parseRow = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += ch;
            }
        }
        result.push(current);
        return result;
    };

    const headers = parseRow(lines[0]);
    const records = lines.slice(1).map(line => {
        const values = parseRow(line);
        const obj: any = {};
        headers.forEach((h, i) => {
            let val: any = values[i] ?? '';
            // amountは数値に変換
            if (h === 'amount') val = Number(val) || 0;
            obj[h] = val;
        });
        return obj;
    });

    return { headers, records };
}

/**
 * CSV のヘッダーを見て incomes か expenses かを推定する
 */
export function detectCSVType(headers: string[]): 'incomes' | 'expenses' | 'unknown' {
    const set = new Set(headers);
    if (set.has('type') && set.has('date') && set.has('amount')) return 'incomes';
    if (set.has('category') && set.has('date') && set.has('amount')) return 'expenses';
    return 'unknown';
}

/**
 * 今日の日付を YYYY-MM-DD 形式で返す
 */
export function todayString(): string {
    return new Date().toISOString().slice(0, 10);
}
