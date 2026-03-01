import React, { useState } from 'react';
import { UploadCloud, Check, AlertCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../UserContext';

interface GoogleDriveUploaderProps {
    documentType: 'receipt' | 'invoice'; // 'receipt'=領収書, 'invoice'=請求書
    year?: string; // 例: "2026", 指定がなければ現在の年を使用
    onUploadSuccess: (fileId: string, webViewLink: string) => void;
}

export const GoogleDriveUploader: React.FC<GoogleDriveUploaderProps> = ({ documentType, year, onUploadSuccess }) => {
    const { googleToken: token } = useUser();
    const [isUploading, setIsUploading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // デフォルト年度の決定（現在の日付から）
    const targetYear = year || new Date().getFullYear().toString();
    const typeFolderName = documentType === 'receipt' ? '領収書(経費)' : '請求書・売上等(収入)';

    // 指定した名前のフォルダを検索、なければ作成するヘルパー関数
    const getOrCreateFolder = async (folderName: string, accessToken: string, parentId?: string): Promise<string> => {
        // 1. 検索
        let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        if (parentId) {
            query += ` and '${parentId}' in parents`;
        }

        const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const searchData = await searchRes.json();

        if (searchData.error) throw new Error(searchData.error.message);

        // 存在すればそのIDを返す
        if (searchData.files && searchData.files.length > 0) {
            return searchData.files[0].id;
        }

        // 2. なければ作成
        const createMetadata: any = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder'
        };
        if (parentId) {
            createMetadata.parents = [parentId];
        }

        const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(createMetadata)
        });
        const createData = await createRes.json();

        if (createData.error) throw new Error(createData.error.message);

        return createData.id;
    };

    const uploadFile = async (file: File) => {
        if (!token) {
            setError('Googleドライブ連携が行われていません');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            // --- 1. フォルダ階層の準備 ---
            setStatusMessage('保存先フォルダを確認中...');

            // Tier 1: アプリ用ルートフォルダ
            const rootFolderId = await getOrCreateFolder('White Tax Return App', token);
            // Tier 2: 年度フォルダ (例: "2026年提出分")
            const yearFolderId = await getOrCreateFolder(`${targetYear}年提出分`, token, rootFolderId);
            // Tier 3: 種類別フォルダ (例: "領収書(経費)" or "請求書・売上等(収入)")
            const targetFolderId = await getOrCreateFolder(typeFolderName, token, yearFolderId);

            // --- 2. ファイル本体のアップロード ---
            setStatusMessage('ファイルを送信中...');

            // ファイル名を手動でユニークにする（タイムスタンプ追加）
            const safeFileName = `${new Date().getTime()}_${file.name}`;
            const metadata = {
                name: safeFileName,
                mimeType: file.type,
                parents: [targetFolderId] // 作成または取得した最下層フォルダに入れる
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: form
            });

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) {
                throw new Error(uploadData.error?.message || 'アップロードに失敗しました');
            }

            setStatusMessage('');
            onUploadSuccess(uploadData.id, uploadData.webViewLink);
        } catch (err: any) {
            setStatusMessage('');
            setError(err.message || 'アップロード中エラーが発生しました');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadFile(e.target.files[0]);
        }
    };

    return (
        <div className="bg-white border text-sm border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <UploadCloud size={18} />
                ファイル添付 (Google Drive)
            </h3>
            <p className="text-xs text-gray-500 mb-3">
                保存先: 📁White Tax Return App / {targetYear}年提出分 / {typeFolderName}
            </p>

            {!token ? (
                <div className="text-center bg-gray-50 rounded-lg p-6 border border-yellow-200">
                    <AlertCircle className="mx-auto mb-2 text-yellow-500" size={24} />
                    <p className="text-gray-600 font-medium mb-1">Google連携が完了していません</p>
                    <p className="text-xs text-gray-500 mb-4">ファイルをアップロードするには、基本情報画面からGoogleアカウントの連携を行ってください。</p>
                    <Link
                        to="/settings"
                        className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 border border-yellow-300 font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-yellow-100 transition-colors"
                    >
                        <Settings size={16} />
                        基本情報設定へ移動
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded text-xs font-medium border border-green-200">
                        <Check size={14} /> Drive連携済み (安全に保存されます)
                    </div>

                    <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors bg-gray-50/50">
                        <div className="text-gray-500">
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2 py-2">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    <span className="font-bold text-primary">{statusMessage}</span>
                                </div>
                            ) : (
                                <div className="py-2">
                                    <UploadCloud className="mx-auto mb-2 text-gray-400 group-hover:text-primary transition-colors" size={28} />
                                    <span className="font-medium text-primary">クリックしてファイルを選択</span>
                                    <p className="text-xs mt-1">またはドラッグ＆ドロップ</p>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </label>
                </div>
            )}

            {error && (
                <div className="mt-3 text-red-600 bg-red-50 p-3 rounded-lg flex items-start gap-2 text-xs border border-red-100">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};
