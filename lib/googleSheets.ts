// lib/googleSheets.ts
// Google Sheets API を利用してスプレッドシートを簡易データベースとして操作するためのヘルパー関数群

const SPREADSHEET_NAME = 'White Tax Return App Database';
const PROFILE_SHEET = 'Profile';
const INCOME_SHEET = 'Incomes';
const EXPENSE_SHEET = 'Expenses';

interface CreateSpreadsheetResponse {
    spreadsheetId: string;
}

/**
 * 既存のDBスプレッドシートを検索し、なければ新規作成して初期設定（タブ作成等）を行う
 */
export async function findOrCreateDatabase(accessToken: string): Promise<string> {
    // 1. Google Driveからファイル名で検索
    const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id)`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const searchData = await searchResponse.json();
    if (searchData.files && searchData.files.length > 0) {
        // 既存のDBを発見
        return searchData.files[0].id;
    }

    // 2. 存在しない場合は新規作成
    const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            properties: {
                title: SPREADSHEET_NAME,
            },
            sheets: [
                {
                    properties: { title: PROFILE_SHEET },
                    data: [{
                        rowData: [{
                            values: [
                                { userEnteredValue: { stringValue: 'id' } },
                                { userEnteredValue: { stringValue: 'name' } },
                                { userEnteredValue: { stringValue: 'job' } },
                                { userEnteredValue: { stringValue: 'phone' } },
                                { userEnteredValue: { stringValue: 'zip' } },
                                { userEnteredValue: { stringValue: 'address' } },
                                { userEnteredValue: { stringValue: 'businessName' } },
                                { userEnteredValue: { stringValue: 'businessAddress' } },
                                { userEnteredValue: { stringValue: 'businessContent' } }
                            ]
                        }]
                    }]
                },
                {
                    properties: { title: INCOME_SHEET },
                    data: [{
                        rowData: [{
                            values: [
                                { userEnteredValue: { stringValue: 'id' } },
                                { userEnteredValue: { stringValue: 'date' } },
                                { userEnteredValue: { stringValue: 'type' } },
                                { userEnteredValue: { stringValue: 'description' } },
                                { userEnteredValue: { stringValue: 'amount' } },
                                { userEnteredValue: { stringValue: 'memo' } },
                                { userEnteredValue: { stringValue: 'receiptUrl' } },
                                { userEnteredValue: { stringValue: 'receiptDriveFileId' } }
                            ]
                        }]
                    }]
                },
                {
                    properties: { title: EXPENSE_SHEET },
                    data: [{
                        rowData: [{
                            values: [
                                { userEnteredValue: { stringValue: 'id' } },
                                { userEnteredValue: { stringValue: 'date' } },
                                { userEnteredValue: { stringValue: 'description' } },
                                { userEnteredValue: { stringValue: 'amount' } },
                                { userEnteredValue: { stringValue: 'category' } },
                                { userEnteredValue: { stringValue: 'memo' } },
                                { userEnteredValue: { stringValue: 'receiptUrl' } },
                                { userEnteredValue: { stringValue: 'receiptDriveFileId' } }
                            ]
                        }]
                    }]
                }
            ],
        }),
    });

    const createData: CreateSpreadsheetResponse = await createResponse.json();
    if (!createResponse.ok) {
        throw new Error(`Failed to create spreadsheet: ${JSON.stringify(createData)}`);
    }

    return createData.spreadsheetId;
}

/**
 * 指定のシート（タブ）の全データを取得し、JSON配列に変換する
 */
export async function getSheetData(accessToken: string, spreadsheetId: string, sheetName: string): Promise<any[]> {
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:Z`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to fetch sheet data: ${JSON.stringify(data)}`);
    }

    console.log(`[getSheetData] Raw API response for ${sheetName}:`, JSON.stringify(data.values));

    if (!data.values || data.values.length <= 1) {
        return []; // ヘッダーしかない、または空の場合
    }

    const headers = data.values[0] as string[];
    const rows = data.values.slice(1);

    return rows.map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header, index) => {
            // 意図的に型変換が必要なフィールド（amount等）を考慮
            let value = row[index] || '';
            if (header === 'amount') {
                value = Number(value);
            }
            obj[header] = value;
        });
        return obj;
    });
}

/**
 * 指定されたスプレッドシートに必須のシート名が存在するか確認し、なければ追加する
 */
export async function ensureSheetsExist(accessToken: string, spreadsheetId: string, requiredSheetNames: string[]): Promise<void> {
    // 現在のシート一覧を取得
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch spreadsheet info: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const existingTitles = data.sheets.map((s: any) => s.properties.title);

    const missingSheets = requiredSheetNames.filter(name => !existingTitles.includes(name));

    if (missingSheets.length === 0) {
        return; // すべて存在すれば何もしない
    }

    console.log(`Creating missing sheets: ${missingSheets.join(', ')}`);

    // 足りないシートを作るためのリクエストを作成
    const requests: any[] = missingSheets.map(title => ({
        addSheet: {
            properties: { title }
        }
    }));

    // batchUpdate でシートを一括追加
    const updateResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests })
    });

    if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(`Failed to create missing sheets: ${JSON.stringify(errorData)}`);
    }

    // 作成直後だと、ヘッダーがない空のシートになるが、
    // 書き込み時 (syncSheetData) にヘッダーごと上書きするのでここでは初期化は不要。
}

/**
 * 複数のシートのデータを一括で取得し、JSON配列のオブジェクトに変換して返す
 * これにより 429 Quota Exceeded (Read requests per minute per user) エラーを防ぐ
 */
export async function batchGetSheetData(accessToken: string, spreadsheetId: string, sheetNames: string[]): Promise<Record<string, any[]>> {
    const rangesQuery = sheetNames.map(name => `ranges=${encodeURIComponent(name + '!A1:Z')}`).join('&');
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${rangesQuery}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to batch fetch sheet data: ${JSON.stringify(data)}`);
    }

    const result: Record<string, any[]> = {};

    data.valueRanges.forEach((valueRange: any, index: number) => {
        const sheetName = sheetNames[index];
        const rows = valueRange.values || [];

        if (rows.length <= 1) {
            result[sheetName] = []; // ヘッダーのみ、または空
            return;
        }

        const headers = rows[0] as string[];
        const dataRows = rows.slice(1);

        result[sheetName] = dataRows.map((row: any[]) => {
            const obj: any = {};
            headers.forEach((header, colIndex) => {
                let value = row[colIndex] || '';
                if (header === 'amount') {
                    value = Number(value);
                }
                obj[header] = value;
            });
            return obj;
        });
    });

    return result;
}

/**
 * 指定のシート（タブ）のデータを全件書き換える (Sync)
 * 既存のデータをクリアし、新しく渡された配列で上書きする
 */
export async function syncSheetData(accessToken: string, spreadsheetId: string, sheetName: string, headers: string[], records: any[]): Promise<void> {
    // 1. レコード全体を2次元配列に変換
    const values = [
        headers, // 1行目はヘッダー
        ...records.map(record => headers.map(header => {
            const val = record[header];
            return val !== undefined && val !== null ? String(val) : '';
        }))
    ];

    // 2. 既存のデータをクリアしてPUTで上書き
    // (Note: `update` API using Range will overwrite only the specified range, 
    // but to handle deletion of rows properly, clearing first is safer, or just overwrite with large range and clear trailing)

    // Clear existing content (excluding header row if we wanted, but we'll clear all and write all)
    await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:Z:clear`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        }
    );

    // Write new content
    const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1?valueInputOption=USER_ENTERED`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                range: `${sheetName}!A1`,
                majorDimension: 'ROWS',
                values: values,
            }),
        }
    );

    if (!updateResponse.ok) {
        const err = await updateResponse.json();
        throw new Error(`Failed to sync sheet data: ${JSON.stringify(err)}`);
    }
}
