import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Tenant, SubscriptionTransaction } from '../../types';
import {
  ShieldCheck,
  Building2,
  Receipt,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  LogOut,
  Sparkles,
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Lock,
  User,
  X,
  RefreshCw,
  Clock,
  Check,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Download,
  Filter,
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const {
    tenants,
    currentTenant,
    switchTenant,
    openLandingPage,
    updateTenant,
    deleteTenant,
    onboardCompany,
    subscriptionTransactions,
    addSubscriptionTransaction,
    isSuperAdminLoggedIn,
    loginSuperAdmin,
    logoutSuperAdmin,
    setIsSuperAdminView,
  } = useTenant();

  // Login form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Tab state
  const [activeTab, setActiveTab] = useState<'transactions' | 'companies' | 'onboard'>('companies');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'trial' | 'paid' | 'expired'>('all');

  // Edit Modal State
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editForm, setEditForm] = useState<Partial<Tenant>>({});

  // Delete Modal State
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);

  // Manual Transaction Modal State
  const [recordingPaymentTenant, setRecordingPaymentTenant] = useState<Tenant | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('200');
  const [paymentMethod, setPaymentMethod] = useState('MTN Mobile Money');

  // Onboarding Form State
  const [onboardForm, setOnboardForm] = useState({
    companyName: '',
    logoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    currency: 'GH₵',
    currencyCode: 'GHS',
    phone: '',
    address: '',
    email: '',
    password: 'admin123',
  });
  const [onboardSuccess, setOnboardSuccess] = useState<string | null>(null);

  // Handle Super Admin Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = loginSuperAdmin(usernameInput, passwordInput);
    if (!success) {
      setLoginError('Invalid Username or Password. Please check your credentials.');
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    updateTenant(editingTenant.id, editForm);
    setEditingTenant(null);
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = () => {
    if (!deletingTenant) return;
    deleteTenant(deletingTenant.id);
    setDeletingTenant(null);
  };

  // Handle Onboard Submit
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.companyName || !onboardForm.email || !onboardForm.phone) return;
    const newTenant = await onboardCompany(onboardForm);
    setOnboardSuccess(`Company "${newTenant.companyName}" onboarded successfully!`);
    setOnboardForm({
      companyName: '',
      logoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      currency: 'GH₵',
      currencyCode: 'GHS',
      phone: '',
      address: '',
      email: '',
      password: 'admin123',
    });
    setTimeout(() => setOnboardSuccess(null), 4000);
    setActiveTab('companies');
  };

  // Handle Record Subscription Renewal
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingPaymentTenant) return;
    const amountNum = parseFloat(paymentAmount) || 200;
    
    // Add transaction record
    addSubscriptionTransaction({
      tenantId: recordingPaymentTenant.id,
      companyName: recordingPaymentTenant.companyName,
      amount: amountNum,
      currency: recordingPaymentTenant.currencyCode || 'GHS',
      billingPeriod: 'Monthly Subscription (30 Days)',
      date: new Date().toISOString(),
      status: 'paid',
      paymentMethod,
      referenceNumber: `SUB-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    // Extend trial/paid date by 30 days
    const currentEnd = new Date(recordingPaymentTenant.trialEndDate).getTime();
    const now = Date.now();
    const newEnd = new Date(Math.max(currentEnd, now) + 30 * 24 * 60 * 60 * 1000).toISOString();

    updateTenant(recordingPaymentTenant.id, {
      trialEndDate: newEnd,
      isTrialActive: true,
    });

    setRecordingPaymentTenant(null);
  };

  // Unauthenticated Login View
  if (!isSuperAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-brand-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20 text-white">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Socialfunera Platform Admin</h1>
            <p className="text-xs text-slate-400 font-medium">
              Multi-Tenant System Operations & Subscription Management
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3.5 bg-rose-950/80 border border-rose-800/80 rounded-2xl text-rose-300 text-xs font-semibold flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin Username</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter Username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500 transition font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin Password</span>
              </label>
              <input
                type="password"
                required
                placeholder="Enter Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500 transition font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-brand-600/30 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticate Super Admin</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={openLandingPage}
              className="text-xs text-slate-400 hover:text-white transition font-medium underline cursor-pointer"
            >
              ← Return to Public Multi-Tenant Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Analytics Math
  const totalCompanies = tenants.length;
  const activeCompanies = tenants.filter((t) => new Date(t.trialEndDate).getTime() > Date.now()).length;
  const totalPaidRevenue = subscriptionTransactions
    .filter((tx) => tx.status === 'paid')
    .reduce((acc, tx) => acc + (tx.amount || 0), 0);
  const estimatedMRR = activeCompanies * 200;

  // Search & Filter Tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      t.databaseId.toLowerCase().includes(searchQuery.toLowerCase());

    const isExpired = new Date(t.trialEndDate).getTime() < Date.now();
    if (statusFilter === 'trial') return matchesSearch && t.isTrialActive && !isExpired;
    if (statusFilter === 'paid') return matchesSearch && !t.isTrialActive && !isExpired;
    if (statusFilter === 'expired') return matchesSearch && isExpired;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Admin Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white tracking-tight">Socialfunera System Control Panel</h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-800">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Platform Subscription Rate: GH₵200 / month • 1 Month Free Trial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openLandingPage}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Portal Directory</span>
            </button>
            <button
              onClick={logoutSuperAdmin}
              className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-bold border border-rose-800/80 transition flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Companies</p>
              <h3 className="text-2xl font-black text-white mt-1">{totalCompanies}</h3>
              <p className="text-[11px] text-emerald-400 font-medium mt-1">Registered Onboards</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Active Portals</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{activeCompanies}</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Valid Trials & Subscriptions</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Est. Monthly Revenue (MRR)</p>
              <h3 className="text-2xl font-black text-white mt-1">GH₵{estimatedMRR.toLocaleString()}</h3>
              <p className="text-[11px] text-emerald-400 font-medium mt-1">@ GH₵200 / Company</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Subscription Collected</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">GH₵{totalPaidRevenue.toLocaleString()}</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Total Paid Transactions</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-2">
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-5 py-3 text-xs font-extrabold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'companies'
                ? 'border-brand-500 text-brand-400 bg-brand-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Companies Registry ({tenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-5 py-3 text-xs font-extrabold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'transactions'
                ? 'border-brand-500 text-brand-400 bg-brand-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Subscription Transactions ({subscriptionTransactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('onboard')}
            className={`px-5 py-3 text-xs font-extrabold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'onboard'
                ? 'border-brand-500 text-brand-400 bg-brand-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Onboard New Company</span>
          </button>
        </div>

        {/* Tab 1: Companies Registry */}
        {activeTab === 'companies' && (
          <div className="space-y-6">
            {/* Search & Filter bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search company, DB, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition font-medium"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="trial">Trial Active</option>
                  <option value="paid">Paid Subscription</option>
                  <option value="expired">Expired</option>
                </select>

                <button
                  onClick={() => setActiveTab('onboard')}
                  className="ml-auto px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Onboard Company</span>
                </button>
              </div>
            </div>

            {/* Companies Table / Cards */}
            {filteredTenants.length === 0 ? (
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center space-y-3">
                <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Companies Match Your Criteria</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Try adjusting your search query or status filter, or onboard a new company.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Company & DB ID</th>
                        <th className="px-6 py-4">Contact Info</th>
                        <th className="px-6 py-4">Currency</th>
                        <th className="px-6 py-4">Subscription & Trial</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-medium">
                      {filteredTenants.map((tenant) => {
                        const trialDaysLeft = Math.ceil(
                          (new Date(tenant.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                        );
                        const isExpired = trialDaysLeft <= 0;

                        return (
                          <tr key={tenant.id} className="hover:bg-slate-800/40 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={tenant.logoUrl}
                                  alt={tenant.companyName}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 bg-slate-950 shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="font-extrabold text-white text-sm block truncate">
                                    {tenant.companyName}
                                  </span>
                                  <span className="font-mono text-[11px] text-slate-400 block truncate">
                                    {tenant.databaseId}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 space-y-0.5">
                              <p className="text-white font-medium truncate">{tenant.phone}</p>
                              <p className="text-slate-400 text-[11px] truncate">{tenant.email}</p>
                              <p className="text-slate-500 text-[10px] truncate">{tenant.address}</p>
                            </td>

                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-extrabold text-xs">
                                {tenant.currencyCode || 'GHS'} ({tenant.currency || 'GH₵'})
                              </span>
                            </td>

                            <td className="px-6 py-4 space-y-1">
                              {isExpired ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-400 text-[10px] font-extrabold border border-rose-800">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Expired</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 text-[10px] font-extrabold border border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Active ({trialDaysLeft} days remaining)</span>
                                </span>
                              )}
                              <p className="text-[10px] text-slate-500">
                                End Date: {new Date(tenant.trialEndDate).toLocaleDateString()}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => switchTenant(tenant.id)}
                                title="Launch Portal"
                                className="p-2 rounded-xl bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white transition cursor-pointer inline-flex items-center gap-1"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span className="text-[11px] font-bold">Launch</span>
                              </button>

                              <button
                                onClick={() => {
                                  setRecordingPaymentTenant(tenant);
                                  setPaymentAmount('200');
                                }}
                                title="Record Renewal Payment"
                                className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition cursor-pointer inline-flex items-center gap-1"
                              >
                                <CreditCard className="w-4 h-4" />
                                <span className="text-[11px] font-bold">Renew</span>
                              </button>

                              <button
                                onClick={() => {
                                  setEditingTenant(tenant);
                                  setEditForm(tenant);
                                }}
                                title="Edit Company Details"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer inline-flex items-center"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeletingTenant(tenant)}
                                title="Delete Company"
                                className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white transition cursor-pointer inline-flex items-center"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Subscription Transactions */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-black text-white">Subscription & Billing Transactions</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Track all company subscription renewals, trial entries, and monthly GH₵200 payment records.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 font-extrabold text-xs">
                  GH₵200 / month flat rate
                </span>
              </div>
            </div>

            {subscriptionTransactions.length === 0 ? (
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center space-y-3">
                <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Subscription Transactions Recorded</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When companies onboard or renew their monthly subscriptions, transactions will be listed here.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Reference & Date</th>
                        <th className="px-6 py-4">Company Name</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Billing Period</th>
                        <th className="px-6 py-4">Payment Method</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-medium">
                      {subscriptionTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-white text-xs block">
                              {tx.referenceNumber}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(tx.date).toLocaleString()}
                            </span>
                          </td>

                          <td className="px-6 py-4 font-extrabold text-white">
                            {tx.companyName}
                          </td>

                          <td className="px-6 py-4 font-black text-emerald-400 text-sm">
                            {tx.currency} {tx.amount.toFixed(2)}
                          </td>

                          <td className="px-6 py-4 text-slate-300">
                            {tx.billingPeriod}
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            {tx.paymentMethod}
                          </td>

                          <td className="px-6 py-4 text-right">
                            {tx.status === 'paid' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-extrabold text-[10px] border border-emerald-800">
                                Paid & Extended
                              </span>
                            )}
                            {tx.status === 'trial' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-brand-950 text-brand-300 font-extrabold text-[10px] border border-brand-800">
                                1 Month Free Trial
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Onboard New Company */}
        {activeTab === 'onboard' && (
          <div className="max-w-2xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-6">
            <div className="border-b border-slate-800/80 pb-4 space-y-1">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-emerald-400" />
                <span>Onboard New Funeral or Social Enterprise</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Sign a new company onto the Socialfunera system. Includes 1 Month Free Trial and GH₵200/mo subscription rate.
              </p>
            </div>

            {onboardSuccess && (
              <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{onboardSuccess}</span>
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Grace Funeral Services"
                  value={onboardForm.companyName}
                  onChange={(e) => setOnboardForm({ ...onboardForm, companyName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Currency Symbol</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GH₵, $, €"
                    value={onboardForm.currency}
                    onChange={(e) => setOnboardForm({ ...onboardForm, currency: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Currency Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GHS, USD, EUR"
                    value={onboardForm.currencyCode}
                    onChange={(e) => setOnboardForm({ ...onboardForm, currencyCode: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +233 54 000 0000"
                    value={onboardForm.phone}
                    onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Admin Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@company.com"
                    value={onboardForm.email}
                    onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Business Address</label>
                <input
                  type="text"
                  placeholder="e.g. Ring Road Central, Accra, Ghana"
                  value={onboardForm.address}
                  onChange={(e) => setOnboardForm({ ...onboardForm, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Logo Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={onboardForm.logoUrl}
                  onChange={(e) => setOnboardForm({ ...onboardForm, logoUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Initial Admin Password</label>
                <input
                  type="text"
                  required
                  placeholder="admin123"
                  value={onboardForm.password}
                  onChange={(e) => setOnboardForm({ ...onboardForm, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-500 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-brand-600/30 transition cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <PlusCircle className="w-5 h-5 text-emerald-200" />
                <span>Onboard Company onto System</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Edit Company Modal */}
      {editingTenant && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-400" />
                <span>Edit Company Details</span>
              </h3>
              <button
                onClick={() => setEditingTenant(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-medium">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Company Name</label>
                <input
                  type="text"
                  value={editForm.companyName || ''}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Currency Symbol</label>
                  <input
                    type="text"
                    value={editForm.currency || ''}
                    onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Currency Code</label>
                  <input
                    type="text"
                    value={editForm.currencyCode || ''}
                    onChange={(e) => setEditForm({ ...editForm, currencyCode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Address</label>
                <input
                  type="text"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Logo Image URL</label>
                <input
                  type="url"
                  value={editForm.logoUrl || ''}
                  onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Admin Password</label>
                  <input
                    type="text"
                    value={editForm.adminPasswordHash || ''}
                    onChange={(e) => setEditForm({ ...editForm, adminPasswordHash: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Trial / Subscription End Date</label>
                  <input
                    type="date"
                    value={editForm.trialEndDate ? new Date(editForm.trialEndDate).toISOString().substring(0, 10) : ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        trialEndDate: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Renewal Payment Modal */}
      {recordingPaymentTenant && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Record Subscription Renewal</span>
              </h3>
              <button
                onClick={() => setRecordingPaymentTenant(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Record a subscription payment for <strong className="text-white">{recordingPaymentTenant.companyName}</strong>. This will extend their active subscription by 30 days.
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs font-medium">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Amount ({recordingPaymentTenant.currencyCode || 'GHS'})</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Telecel Cash">Telecel Cash</option>
                  <option value="AT Money">AT Money</option>
                  <option value="Visa / Mastercard">Visa / Mastercard</option>
                  <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                  <option value="Cash Payment">Cash Payment</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRecordingPaymentTenant(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold cursor-pointer"
                >
                  Record Payment (+30 Days)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTenant && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-white">Delete Company Portal?</h3>
              <p className="text-xs text-slate-400 font-medium">
                Are you sure you want to permanently delete <strong className="text-white">{deletingTenant.companyName}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingTenant(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
