import React, { useState, useEffect } from 'react';
import { Layout, BackButton } from '../components/Layout';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useUser } from '../UserContext';

export const Settings = () => {
  const { profile, updateProfile } = useUser();
  
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

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update global context
      updateProfile({
        name: formData.name,
        phone: formData.phone,
        zip: formData.zip,
        address: formData.address,
        job: formData.job,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        businessContent: formData.businessContent
      });
      
      setIsSaving(false);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1000);
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