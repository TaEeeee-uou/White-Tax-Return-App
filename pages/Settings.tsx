import React, { useState, useEffect } from 'react';
import { Layout, BackButton } from '../components/Layout';
import { CheckCircle, Loader2, Database } from 'lucide-react';
import { useUser } from '../UserContext';
import { findOrCreateDatabase, getSheetData, syncSheetData, batchGetSheetData, ensureSheetsExist } from '../lib/googleSheets';

export const Settings = () => {
  const { profile, updateProfile, googleToken, setGoogleToken, spreadsheetId, setSpreadsheetId, setIncomes, setExpenses } = useUser();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false); // DB同期中のローディング状態

  const [formData, setFormData] = useState({
    name: profile.name,
    phone: profile.phone,
    zip: profile.zip,
    address: profile.address,
    job: profile.job,
    businessName: profile.businessName,
    businessAddress: profile.businessAddress,
    businessContent: profile.businessContent,
    sameAddress: profile.address === profile.businessAddress
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize Google Token Client
  useEffect(() => {
    let checkGoogleApi: NodeJS.Timeout;

    const initClient = () => {
      /* global google */
      if ((window as any).google?.accounts?.oauth2) {
        try {
          const client = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id-for-preview',
            // Drive API にくわえ、Sheets API のスコープを追加
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
            callback: (response: any) => {
              if (response.error) {
                console.error("Auth error:", response.error);
                setAuthError('認証に失敗またはキャンセルされました');
                return;
              }
              console.log("Auth success, token received.");
              setGoogleToken(response.access_token);
              setAuthError(null);
            },
          });
          (window as any).tokenClient = client;
          console.log("Google Token Client initialized successfully.");
        } catch (error) {
          console.error("Error initializing Google Token Client:", error);
          setAuthError('認証モジュールの初期化に失敗しました');
        }
      }
    };

    if (!(window as any).google?.accounts?.oauth2) {
      checkGoogleApi = setInterval(() => {
        if ((window as any).google?.accounts?.oauth2) {
          clearInterval(checkGoogleApi);
          initClient();
        }
      }, 300);
    } else {
      initClient();
    }

    return () => {
      if (checkGoogleApi) clearInterval(checkGoogleApi);
    };
  }, [setGoogleToken]);

  // Spreadsheet URL
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');

  // 抽出用ヘルパー
  const extractSpreadsheetId = (url: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  // Google連携完了＆URL入力後、スプレッドシートからデータを取得する
  const syncDatabase = async () => {
    if (!googleToken) {
      setAuthError('先にGoogle認証を行ってください。');
      return;
    }

    const dbId = extractSpreadsheetId(spreadsheetUrl);
    if (!dbId) {
      setAuthError('有効なGoogle SpreadsheetのURLを入力してください。');
      return;
    }

    setIsSyncing(true);
    try {
      setAuthError(null);
      setSpreadsheetId(dbId);

      // まず、必要なシート（タブ）がそのスプレッドシートに存在するか確認・作成する
      await ensureSheetsExist(googleToken, dbId, ['Profile', 'Incomes', 'Expenses']);

      // batchGetで3つのシート（タブ）のデータを1回のAPIリクエストで一括取得する
      const allData = await batchGetSheetData(googleToken, dbId, ['Profile', 'Incomes', 'Expenses']);

      const profileData = allData['Profile'] || [];
      const incomesData = allData['Incomes'] || [];
      const expensesData = allData['Expenses'] || [];

      // 取得したデータが存在すれば Context を上書き
      if (profileData.length > 0) {
        updateProfile(profileData[0]);
        setFormData({
          ...formData,
          ...profileData[0],
          sameAddress: profileData[0].address === profileData[0].businessAddress
        });
      }
      if (incomesData.length > 0) {
        setIncomes(incomesData);
      }
      if (expensesData.length > 0) {
        setExpenses(expensesData);
      }

      console.log("Database synced successfully from provided URL.");
    } catch (err: any) {
      console.error("Database sync failed:", err);
      // 詳細なエラー表示
      let errorMsg = err.message || '不明なエラーが発生しました。';
      if (errorMsg.includes('403') || errorMsg.includes('PERMISSION_DENIED')) {
        errorMsg = 'スプレッドシートへのアクセス権限がありません。URLが正しいか、共有設定が「リンクを知っている全員（編集可）」またはご自身のGoogleアカウントに編集権限があるか確認してください。';
      } else if (errorMsg.includes('404') || errorMsg.includes('NOT_FOUND')) {
        errorMsg = '指定されたスプレッドシートが見つかりません。URLを再確認してください。';
      }
      setAuthError(`データベース同期エラー: ${errorMsg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleAuth = () => {
    setAuthError(null);
    if ((window as any).tokenClient) {
      console.log("Requesting access token...");
      (window as any).tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      console.error("Token client is not initialized.");
      setAuthError('Google認証の準備ができていません。画面をリロードしてください。');
    }
  };

  // Sync address if checkbox is checked
  useEffect(() => {
    if (formData.sameAddress) {
      setFormData(prev => ({ ...prev, businessAddress: prev.address }));
    }
  }, [formData.address, formData.sameAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSameAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, sameAddress: e.target.checked }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    const updatedProfile = {
      name: formData.name,
      phone: formData.phone,
      zip: formData.zip,
      address: formData.address,
      job: formData.job,
      businessName: formData.businessName,
      businessAddress: formData.businessAddress,
      businessContent: formData.businessContent
    };

    // Update global context
    updateProfile(updatedProfile);

    // Save to Google Spreadsheet if connected
    if (googleToken && spreadsheetId) {
      try {
        await syncSheetData(
          googleToken,
          spreadsheetId,
          'Profile',
          ['id', 'name', 'job', 'phone', 'zip', 'address', 'businessName', 'businessAddress', 'businessContent'],
          [{ id: '1', ...updatedProfile }]
        );
        console.log("Profile saved to database.");
      } catch (err) {
        console.error("Failed to save profile to database:", err);
      }
    }

    setIsSaving(false);
    setShowSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <Layout variant="sidebar">
      <div className="max-w-4xl mx-auto pb-24">

        {/* Header */}
        <div className="mb-8">
          <BackButton />
          <h1 className="text-3xl font-black text-gray-900 mb-2">基本情報設定</h1>
          <p className="text-gray-500">確定申告に必要な個人および事業の基本情報を設定・編集します。</p>
        </div>

        <div className="space-y-12">
          {/* Personal Info Section */}
          <section className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">申告者情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">氏名</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary h-12"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">住所</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    placeholder="郵便番号"
                    className="w-full sm:w-40 border-gray-300 rounded-lg focus:ring-primary focus:border-primary h-12"
                  />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="市区町村・番地"
                    className="flex-1 border-gray-300 rounded-lg focus:ring-primary focus:border-primary h-12"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Business Info Section */}
          <section className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">事業情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">職業</label>
                <input
                  type="text"
                  name="job"
                  value={formData.job}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">屋号</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary h-12"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">事業所所在地</label>
                <input
                  type="text"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  disabled={formData.sameAddress}
                  className={`w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary h-12 ${formData.sameAddress ? 'bg-gray-100 text-gray-500' : ''}`}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="same"
                    checked={formData.sameAddress}
                    onChange={handleSameAddressChange}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="same" className="text-sm text-gray-600 cursor-pointer select-none">申告者情報と同じ</label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">事業内容</label>
                <textarea
                  rows={4}
                  name="businessContent"
                  value={formData.businessContent}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary resize-none"
                ></textarea>
              </div>
            </div>
          </section>

          {/* External Integrations Section */}
          <section className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">外部サービス連携 (データベース)</h2>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Step 1. Google 認証
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    スプレッドシートと連携し、入力したデータをクラウドに保存するためにGoogleアカウントで認証します。
                  </p>
                </div>
                <div>
                  {googleToken ? (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg font-medium border border-green-200">
                      <CheckCircle size={18} />
                      認証済み
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      className="bg-white text-gray-700 border border-gray-300 font-medium py-2 px-6 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      Googleで認証する
                    </button>
                  )}
                </div>
              </div>

              {googleToken && (
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Database size={20} className="text-primary" />
                    Step 2. データベース(スプレッドシート)の指定
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    ご自身で作成したGoogleスプレッドシートのURLを貼り付け、データを同期してください。
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={spreadsheetUrl}
                      onChange={(e) => setSpreadsheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/1ZJxIfF9TTVdqyR_CjkLhFdrNm.../edit"
                      className="flex-1 border-gray-300 rounded-lg focus:ring-primary focus:border-primary h-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={syncDatabase}
                      disabled={isSyncing || !spreadsheetUrl}
                      className="bg-primary text-white font-medium px-6 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap min-w-[140px] h-10"
                    >
                      {isSyncing ? (
                        <><Loader2 className="animate-spin" size={16} /> 同期中...</>
                      ) : spreadsheetId ? (
                        <><CheckCircle size={16} /> 再同期する</>
                      ) : (
                        'データベースに接続'
                      )}
                    </button>
                  </div>
                  {spreadsheetId && !isSyncing && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1 font-medium">
                      <CheckCircle size={14} /> スプレッドシート ({spreadsheetId.substring(0, 10)}...) と連携中です
                    </p>
                  )}
                </div>
              )}

              {authError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-bold text-red-800">連携エラーが発生しました</h4>
                      <p className="text-sm text-red-700 mt-1 break-all">{authError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Floating Footer */}
        <div className="fixed bottom-0 right-0 w-full lg:w-[calc(100%-16rem)] border-t border-gray-200 bg-white/90 backdrop-blur-sm p-4 flex justify-end items-center gap-4">
          <div className={`flex items-center gap-2 text-green-600 transition-opacity duration-300 ${showSuccess ? 'opacity-100' : 'opacity-0'}`}>
            <CheckCircle size={20} />
            <span className="text-sm font-medium">保存しました</span>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-white font-bold h-12 px-8 rounded-lg hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && <Loader2 className="animate-spin" size={20} />}
            {isSaving ? '保存中...' : '保存する'}
          </button>
        </div>

      </div>
    </Layout>
  );
};