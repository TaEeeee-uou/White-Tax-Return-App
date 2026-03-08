import Tesseract from 'tesseract.js';

export interface OCRResult {
    text: string;
    confidence: number;
}

export async function processImageWithOCR(imageFile: File | string): Promise<OCRResult> {
    try {
        const result = await Tesseract.recognize(
            imageFile,
            'jpn',
            {
                logger: (m) => {
                    // console.log(m); // You can use this for a progress bar
                }
            }
        );

        return {
            text: result.data.text,
            confidence: result.data.confidence,
        };
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('画像の読み取りに失敗しました。');
    }
}

/**
 * テキストから金額らしき数値を抽出する簡易ヘルパー
 */
export function extractPotentialAmount(text: string): number | null {
    // 正規表現で ￥ 記号や円がついた数字、あるいは単独のカンマ区切りの数字を抽出
    // ※完璧ではないため、あくまで補助機能
    const matches = text.match(/[￥¥]?\s*([0-9,]+)\s*(円)?/g);

    if (!matches || matches.length === 0) return null;

    // 抽出された金額らしき文字列の中から最大のもの（合計金額の可能性が高い）を返す
    let maxAmount = 0;
    for (const match of matches) {
        const numStr = match.replace(/[^0-9]/g, '');
        if (numStr) {
            const num = parseInt(numStr, 10);
            if (num > maxAmount) {
                maxAmount = num;
            }
        }
    }

    return maxAmount > 0 ? maxAmount : null;
}

/**
 * テキストから日付らしき文字列を抽出する簡易ヘルパー
 */
export function extractPotentialDate(text: string): string | null {
    // 令和X年Y月Z日、202X年Y月Z日、YYYY/MM/DD、YYYY-MM-DD など
    const regexes = [
        /(令和|平成)?([0-9元]{1,2})年\s*([0-9]{1,2})月\s*([0-9]{1,2})日/,
        /20[0-9]{2}年\s*([0-9]{1,2})月\s*([0-9]{1,2})日/,
        /20[0-9]{2}[\/\-]([0-9]{1,2})[\/\-]([0-9]{1,2})/,
    ];

    for (const regex of regexes) {
        const match = text.match(regex);
        if (match) {
            // 見つかったら一旦そのまま返す（ExpenseInputのDate形式 YYYY-MM-DD にパースできるとベター）
            // ここでは簡易的に見つかった文字列そのものを返す。実際は加工が必要
            return match[0];
        }
    }
    return null;
}
