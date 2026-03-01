import React, { useState, useEffect } from 'react';
import { UploadCloud, Check, AlertCircle } from 'lucide-react';

declare global {
    interface Window {
        google: any;
        tokenClient: any;
    }
}

interface GoogleDriveUploaderProps {
    onUploadSuccess: (fileId: string, webViewLink: string) => void;
}

export const GoogleDriveUploader: React.FC<GoogleDriveUploaderProps> = ({ onUploadSuccess }) => {
    const [token, setToken] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 認証情報の初期化
        const initClient = () => {
            /* global google */
            if (window.google?.accounts?.oauth2) {
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id-for-preview',
                    scope: 'https://www.googleapis.com/auth/drive.file',
                    callback: (response: any) => {
                        if (response.error) {
                            setError('認証に失敗しました');
                            return;
                        }
                        setToken(response.access_token);
                        setError(null);
                    },
                });
                window.tokenClient = client;
            }
        };

        // スクリプトの読み込み完了を待機
        const checkGoogleApi = setInterval(() => {
            if (window.google) {
                clearInterval(checkGoogleApi);
                initClient();
            }
        }, 100);

        return () => clearInterval(checkGoogleApi);
    }, []);

    const handleAuthClick = () => {
        if (window.tokenClient) {
            window.tokenClient.requestAccessToken();
        } else {
            setError('Google認証スクリプトが読み込まれていません');
        }
    };

    const uploadFile = async (file: File) => {
        if (!token) {
            setError('先にGoogleで認証してください');
            return;
        }

        setIsUploading(true);
        setError(null);

        const metadata = {
            name: file.name,
            mimeType: file.type,
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        try {
            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: form
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'アップロードに失敗しました');
            }

            onUploadSuccess(data.id, data.webViewLink);
        } catch (err: any) {
            setError(err.message || 'アップロードエラー');
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
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <UploadCloud size={18} />
                領収書・請求書を添付 (Google Drive)
            </h3>

            {!token ? (
                <div className="text-center bg-gray-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-gray-500 mb-3">Google Driveに画像やPDFを保存します</p>
                    <button
                        type="button"
                        onClick={handleAuthClick}
                        className="bg-white text-gray-700 border border-gray-300 font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2 mx-auto"
                    >
                        {/* simple Google logo approximation */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google アカウントで認証
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded text-xs font-medium border border-green-200">
                        <Check size={14} /> Drive認証済み
                    </div>

                    <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors">
                        <div className="text-gray-500">
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    <span>アップロード中...</span>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud className="mx-auto mb-2 text-gray-400" size={24} />
                                    <span className="font-medium text-primary">クリックしてファイルを選択</span>
                                    <p className="text-xs mt-1">またはドラッグ＆ドロップ</p>
                                </>
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
                <div className="mt-3 text-red-600 bg-red-50 p-3 rounded-lg flex items-start gap-2 text-xs">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};
