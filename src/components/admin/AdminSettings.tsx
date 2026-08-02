import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Settings,
  Building2,
  KeyRound,
  Check,
  DollarSign,
  UploadCloud,
  Loader2,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';
import { uploadToCloudinary } from '../../utils/cloudinary';

interface AdminSettingsProps {
  onOpenSupabaseModal?: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = () => {
  const { settings, updateSettings, updateAdminPassword, showToast } = useStore();

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Company details state
  const [shopName, setShopName] = useState(settings.shopName);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(settings.companyLogoUrl);
  const [companyAddress, setCompanyAddress] = useState(
    settings.companyAddress || settings.address || ''
  );
  const [companyPhone, setCompanyPhone] = useState(
    settings.companyPhone || settings.phone || ''
  );
  const [companyEmail, setCompanyEmail] = useState(
    settings.companyEmail || settings.email || ''
  );
  const [currency, setCurrency] = useState(settings.currency);

  // Admin password reset state
  const [prevPass, setPrevPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPrevPass, setShowPrevPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleSaveCompanyInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      shopName,
      companyLogoUrl,
      companyAddress,
      companyPhone,
      companyEmail,
      currency,
    });
    showToast('Store settings updated successfully!', 'success');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      showToast('New Password and Confirm Password do not match!', 'error');
      return;
    }

    const success = await updateAdminPassword(prevPass, newPass);
    if (success) {
      setPrevPass('');
      setNewPass('');
      setConfirmPass('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Store &amp; System Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure company branding, contact details, system currency, and administrator credentials
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-gold-200 text-gold-800 font-black text-xs px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Configuration</span>
          </span>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Company Branding & Information (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Company Information &amp; Branding
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage your store name, logo, and contact info
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveCompanyInfo} className="p-6 space-y-6 flex-1 flex flex-col justify-between text-xs">
            <div className="space-y-5">
              {/* Shop Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center justify-between">
                  <span>Shop / Business Name *</span>
                  <span className="text-[10px] font-normal text-slate-400">Displayed across all invoices &amp; headers</span>
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Beauty Salon Management"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                />
              </div>

              {/* Company Logo */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                  Company Logo Image
                </label>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden shadow-xs">
                    {companyLogoUrl ? (
                      <img
                        src={companyLogoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-white/80" />
                    )}
                  </div>
                  <div className="flex-1 w-full min-w-0 space-y-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="url"
                        value={companyLogoUrl}
                        onChange={(e) => setCompanyLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white text-xs"
                      />
                      <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl cursor-pointer transition shrink-0 shadow-xs">
                        {isUploadingLogo ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4" />
                            <span>Upload Logo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingLogo}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsUploadingLogo(true);
                            try {
                              const res = await uploadToCloudinary(file);
                              setCompanyLogoUrl(res.secureUrl);
                              showToast(
                                'Logo uploaded successfully!',
                                'success'
                              );
                            } catch (err: any) {
                              showToast(
                                err.message || 'Logo upload failed',
                                'error'
                              );
                            } finally {
                              setIsUploadingLogo(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Upload a PNG/JPG logo via Cloudinary or paste a direct image URL.
                    </p>
                  </div>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                  System Currency Symbol
                </label>
                <CustomSelect
                  value={currency}
                  onChange={setCurrency}
                  options={[
                    { value: 'GH₵', label: 'GH₵ - Ghana Cedi (GHS)' },
                    { value: '$', label: '$ - US Dollar (USD)' },
                    { value: '€', label: '€ - Euro (EUR)' },
                    { value: '£', label: '£ - British Pound (GBP)' },
                    { value: '₦', label: '₦ - Nigerian Naira (NGN)' },
                    { value: 'KSh', label: 'KSh - Kenyan Shilling (KES)' },
                    { value: 'R', label: 'R - South African Rand (ZAR)' },
                  ]}
                  className="w-full"
                  buttonClassName="w-full py-3 text-sm"
                  icon={<DollarSign className="w-4 h-4 text-brand-600" />}
                />
              </div>

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-orange-600" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="+233 54 000 0000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-orange-600" />
                    <span>Official Email</span>
                  </label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="info@yourshop.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Physical Address */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  <span>Physical Address</span>
                </label>
                <textarea
                  rows={2}
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Accra, Ghana"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Store Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Admin Password Reset (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Security &amp; Credentials
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update your administrator password
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordReset} className="p-6 space-y-6 flex-1 flex flex-col justify-between text-xs">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-gold-200 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white text-xs">
                    Admin Password Security
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Choose a strong password to protect your store analytics, employee directory, and system configurations.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showPrevPass ? 'text' : 'password'}
                    required
                    value={prevPass}
                    onChange={(e) => setPrevPass(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-4 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPrevPass(!showPrevPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                    title={showPrevPass ? 'Hide password' : 'Show password'}
                  >
                    {showPrevPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-4 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                    title={showNewPass ? 'Hide password' : 'Show password'}
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-4 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                    title={showConfirmPass ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

