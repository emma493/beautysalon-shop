import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Building2,
  Database,
  CheckCircle2,
  DownloadCloud,
  Users,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  Globe,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Lock,
  Layers,
  ChevronRight,
  Loader2,
  Check,
  X,
  ExternalLink,
  DollarSign,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { CloudinaryImageUpload } from '../common/CloudinaryImageUpload';
import { uploadToCloudinary } from '../../utils/cloudinary';

const CURRENCY_OPTIONS = [
  { code: 'GHS', symbol: 'GH₵', label: 'Ghana Cedi (GH₵)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira (₦)' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand (R)' },
  { code: 'CAD', symbol: '$', label: 'Canadian Dollar ($)' },
  { code: 'AUD', symbol: '$', label: 'Australian Dollar ($)' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)' },
];

export const LandingPage: React.FC = () => {
  const { tenants, onboardCompany, switchTenant, getTenantUrl } = useTenant();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdTenantUrl, setCreatedTenantUrl] = useState<string | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [logoImages, setLogoImages] = useState<string[]>([]);
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('GHS');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenForm = () => {
    setIsFormOpen(true);
    setErrorMessage('');
    setCreatedTenantUrl(null);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!companyName.trim()) {
      setErrorMessage('Please enter your Company Name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter a Phone Number.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please enter a Physical Address.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid Email Address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    const currObj = CURRENCY_OPTIONS.find((c) => c.code === selectedCurrency) || CURRENCY_OPTIONS[0];
    const finalLogoUrl =
      logoImages[0] || customLogoUrl.trim() || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80';

    setIsCreating(true);

    try {
      const newTenant = await onboardCompany({
        companyName: companyName.trim(),
        logoUrl: finalLogoUrl,
        currency: currObj.symbol,
        currencyCode: currObj.code,
        phone: phone.trim(),
        address: address.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      });

      const dedicatedUrl = getTenantUrl(newTenant);
      setCreatedTenantUrl(dedicatedUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create company portal.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-brand-500 selection:text-white">
      {/* Background Accent Gradients */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[140px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => switchTenant(null)}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-500 p-0.5 shadow-lg shadow-brand-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight block">
                Socialfunera
              </span>
              <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase block -mt-1">
                Management Systems
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400">
            <a href="#overview" className="hover:text-white transition">Overview</a>
            <a href="#features" className="hover:text-white transition">Architecture & Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing Plan</a>
            <a href="#tenants" className="hover:text-white transition">Company Portals</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenForm}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-brand-600/25 transition-all transform hover:scale-[1.02] cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>Onboard Company</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-brand-500/30 text-emerald-400 text-xs font-bold shadow-xl">
            <Globe className="w-4 h-4 text-brand-400" />
            <span>Multi-Tenant Enterprise Architecture with Cloudflare & Firestore</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Socialfunera <br />
            <span className="bg-gradient-to-r from-brand-400 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              Management Systems
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Empower funeral homes, bereavement service providers, and social management enterprises with dedicated, isolated Firestore databases, automated 1-month free trial billing, POS invoicing, and 31st December offline snapshot backups.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleOpenForm}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-500 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-brand-600/30 transition transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-3"
            >
              <span>Onboard Your Company Now</span>
              <ArrowRight className="w-5 h-5 text-emerald-200" />
            </button>

            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>View 1 Month Trial Pricing</span>
            </a>
          </div>

          {/* Architecture Badge Line */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xs">
              <Database className="w-5 h-5 text-brand-400 mb-2" />
              <div className="text-xs font-bold text-white">Separate Firestore DB</div>
              <div className="text-[11px] text-slate-500">Dedicated database per company</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xs">
              <Zap className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-xs font-bold text-white">Real-Time Sync</div>
              <div className="text-[11px] text-slate-500">Global frontend & backend updates</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-cyan-400 mb-2" />
              <div className="text-xs font-bold text-white">Cloudflare Pages</div>
              <div className="text-[11px] text-slate-500">Custom company portal URLs</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xs">
              <DownloadCloud className="w-5 h-5 text-amber-400 mb-2" />
              <div className="text-xs font-bold text-white">Annual Offline Snapshots</div>
              <div className="text-[11px] text-slate-500">Dec 31st export & system reset</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plan Section */}
      <section id="pricing" className="py-20 bg-slate-900/40 border-y border-slate-800/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Simple, Transparent Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              One Flat Rate for Complete Enterprise Power
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-medium">
              Start with a 1 Month Free Trial. Everything you need to manage products, staff, transactions, and company operations seamlessly.
            </p>
          </div>

          {/* Professional SaaS Pricing Card */}
          <div className="max-w-lg mx-auto bg-slate-950 rounded-3xl border-2 border-brand-500/40 p-8 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-brand-500/70 transition-all duration-300">
            {/* Top Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-brand-600 to-emerald-600 text-white font-black text-[11px] uppercase tracking-wider px-6 py-2 rounded-bl-2xl shadow-md">
              1 Month Free Trial
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>Socialfunera Professional</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Full access to all management features for your entire team</p>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-2 pb-6 border-b border-slate-800/80">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">GH₵200</span>
                <span className="text-sm font-bold text-slate-400">/ month</span>
                <span className="text-xs text-emerald-400 font-bold ml-auto px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60">
                  1 Month Free Trial
                </span>
              </div>

              <div className="text-xs text-slate-400 -mt-2 font-medium">
                GH₵0 for the first 30 days. Cancel anytime before trial ends.
              </div>

              {/* Clean Pricing Specs List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-bold">1 Month Free Trial</strong>
                    <p className="text-[11px] text-slate-400">Full unlimited access for 30 days with zero upfront commitment</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-bold">Add Unlimited Workers</strong>
                    <p className="text-[11px] text-slate-400">Create staff logins for directors, managers, handlers, and cashiers</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-bold">Add Unlimited Products & Services</strong>
                    <p className="text-[11px] text-slate-400">Manage caskets, floral arrangements, venue packages, & memorial items</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-bold">Process Unlimited Transactions Per Day</strong>
                    <p className="text-[11px] text-slate-400">High-capacity Point of Sale invoicing and sales record tracking</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-bold">POS Sales & Invoicing Receipts</strong>
                    <p className="text-[11px] text-slate-400">Generate downloadable PDF invoices and printable thermal receipts</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-bold">Multi-Currency & Custom Branding</strong>
                    <p className="text-[11px] text-slate-400">Configure GHS, USD, EUR, or local currency with custom company logo</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-bold">Role-Based Access Control</strong>
                    <p className="text-[11px] text-slate-400">Secure Admin vs. Worker views to safeguard sensitive company finances</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleOpenForm}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-500 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-brand-600/30 transition cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <span>Start 1 Month Free Trial</span>
                <ArrowRight className="w-4 h-4 text-emerald-200" />
              </button>
            </div>
          </div>

          {/* Trust Badges under Pricing */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-slate-400 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-Bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>99.9% Uptime Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Instant Cloud Activation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarded Company Portals Directory */}
      <section id="tenants" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Active Company Portals</h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Select any company portal below to launch its dedicated management workspace.
            </p>
          </div>

          <button
            onClick={handleOpenForm}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Onboard New Company</span>
          </button>
        </div>

        {tenants.length === 0 ? (
          /* Empty Directory State */
          <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
              <Building2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No Company Portals Registered Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Be the first company to onboard! Provision your custom portal with a 1 month free trial and GH₵200/month plan.
              </p>
            </div>
            <button
              onClick={handleOpenForm}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Onboard Your Company Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between space-y-4 hover:border-brand-500/50 transition group"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={t.logoUrl}
                    alt={t.companyName}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0 bg-slate-800"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white truncate group-hover:text-emerald-400 transition">
                      {t.companyName}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                      DB: {t.databaseId}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 text-[10px] font-bold border border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Trial Active • {t.currencyCode}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800/80 pt-3 font-medium">
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{t.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{t.address}</span>
                  </div>
                </div>

                <button
                  onClick={() => switchTenant(t.id)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-brand-600 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Launch Dedicated Portal</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-center text-xs text-slate-500 space-y-2">
        <p className="font-extrabold text-slate-400">Socialfunera Management Systems</p>
        <p>© 2026 Socialfunera Inc. Multi-Tenant Enterprise Cloudflare & Firestore Platform.</p>
      </footer>

      {/* ONBOARDING FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-500 p-0.5">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Company Onboarding</h3>
                  <p className="text-xs text-slate-400">Setup your dedicated company portal with a separate Firestore database</p>
                </div>
              </div>

              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success View when Tenant Created */}
            {createdTenantUrl ? (
              <div className="space-y-6 py-4 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-white">Company Portal Created!</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Your dedicated system has been provisioned with a separate Firestore database starting with a fresh, blank canvas.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-left text-xs">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Your Dedicated Cloudflare Portal URL:</div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold text-xs break-all">
                    <span>{createdTenantUrl}</span>
                    <ExternalLink className="w-4 h-4 shrink-0 text-slate-400 ml-2" />
                  </div>
                  <div className="text-[11px] text-slate-400">
                    • Admin Email: <strong className="text-white">{email}</strong><br />
                    • Free Trial: <strong className="text-emerald-400">1 Month Active</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsFormOpen(false);
                      setCreatedTenantUrl(null);
                    }}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close Modal
                  </button>
                  <button
                    onClick={() => {
                      setIsFormOpen(false);
                      setCreatedTenantUrl(null);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
                  >
                    Enter Portal Now
                  </button>
                </div>
              </div>
            ) : (
              /* One Page Form */
              <form onSubmit={handleCreateAccount} className="space-y-5">
                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-400">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Grace & Peace Memorials"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* Logo Upload via Cloudinary */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300">Company Logo (Stored on Cloudinary)</label>
                    <CloudinaryImageUpload
                      images={logoImages}
                      onChange={(imgs) => setLogoImages(imgs)}
                      maxImages={1}
                      label=""
                      subtitle="Upload logo file to Cloudinary or paste image URL below"
                    />
                    {!logoImages[0] && (
                      <input
                        type="url"
                        value={customLogoUrl}
                        onChange={(e) => setCustomLogoUrl(e.target.value)}
                        placeholder="Or enter image URL (e.g. https://res.cloudinary.com/...)"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 mt-2"
                      />
                    )}
                  </div>

                  {/* Currency Options */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Operational Currency *</label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233 54 285 9612"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* Physical Address */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300">Physical Address *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 14 Memorial Drive, Accra, Ghana"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300">Admin Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@company.com"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Password *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 Month Free Trial activated automatically. Billing begins after 30 days.</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-500 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-brand-600/30 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Provisioning Custom Firestore Database...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>Create Account & Provision System</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
