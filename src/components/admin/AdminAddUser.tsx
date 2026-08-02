import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  UserPlus,
  Download,
  Eye,
  EyeOff,
  Edit,
  KeyRound,
  Copy,
  Check,
  X,
  Shield,
  UploadCloud,
  Loader2,
  User,
  Mail,
  ShieldCheck,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { generateWorkerCardPDF } from '../../utils/pdfGenerator';
import { UserProfile } from '../../types';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { CustomDatePicker } from '../common/CustomDatePicker';

export const AdminAddUser: React.FC = () => {
  const {
    workers,
    addWorker,
    updateWorker,
    removeWorker,
    generateWorkerId,
    resetWorkerPassword,
    settings,
    showToast,
  } = useStore();

  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list');
  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'security' | 'photo'>('personal');

  const [detailWorker, setDetailWorker] = useState<UserProfile | null>(null);
  const [editingWorker, setEditingWorker] = useState<UserProfile | null>(null);
  const [resetPassWorker, setResetPassWorker] = useState<UserProfile | null>(null);
  const [workerToRemove, setWorkerToRemove] = useState<UserProfile | null>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);

  // Form State
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otherNames, setOtherNames] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ghanaCardId, setGhanaCardId] = useState('');
  const [location, setLocation] = useState('');
  const [dateOfEmployment, setDateOfEmployment] = useState('');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showWorkerPassword, setShowWorkerPassword] = useState(false);
  const [showResetWorkerPassword, setShowResetWorkerPassword] = useState(false);
  const [workerId, setWorkerId] = useState('');

  const [copiedId, setCopiedId] = useState(false);
  const [newWorkerPasswordInput, setNewWorkerPasswordInput] = useState('');

  const formatEmploymentDateDisplay = (dateVal?: string) => {
    const now = new Date();
    if (!dateVal) {
      const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${dateStr} at ${timeStr}`;
    }
    if (dateVal.includes('at')) return dateVal;
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return dateVal;
      if (!dateVal.includes('T') && !dateVal.includes(':')) {
        d.setHours(now.getHours(), now.getMinutes());
      } else if (d.getHours() === 0 && d.getMinutes() === 0) {
        d.setHours(now.getHours(), now.getMinutes());
      }
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${dateStr} at ${timeStr}`;
    } catch {
      return dateVal;
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setOtherNames('');
    setPhoneNumber('');
    setGhanaCardId('');
    setLocation('');
    setDateOfEmployment('');
    setNotes('');
    setEmail('');
    setPassword('');
    setWorkerId('');
    setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
    setEditingWorker(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setViewMode('add');
    setActiveTab('personal');
  };

  const handleStartEdit = (w: UserProfile) => {
    setEditingWorker(w);
    setFirstName(w.firstName || '');
    setLastName(w.lastName || '');
    setOtherNames(w.otherNames || '');
    setPhoneNumber(w.phoneNumber || '');
    setGhanaCardId(w.ghanaCardId || '');
    setLocation(w.location || '');
    setDateOfEmployment(w.dateOfEmployment || '');
    setNotes(w.notes || '');
    setEmail(w.email || '');
    // Never prefill the password field with the stored (hashed) value —
    // leaving it blank keeps the current password unless the admin types
    // a new one (see updateWorker in StoreContext).
    setPassword('');
    setWorkerId(w.id || '');
    setAvatarUrl(w.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
    setViewMode('edit');
    setActiveTab('personal');
  };

  const handleGenerateId = () => {
    if (!firstName.trim()) {
      showToast('Please enter Firstname before generating ID', 'error');
      return;
    }
    const gen = generateWorkerId(firstName);
    setWorkerId(gen);
    showToast('Worker ID generated successfully!', 'success');
  };

  const handleCopyId = () => {
    if (workerId) {
      navigator.clipboard.writeText(workerId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      showToast('Worker ID copied to clipboard!', 'success');
    }
  };

  const handleAvatarFile = async (file?: File) => {
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const res = await uploadToCloudinary(file);
      setAvatarUrl(res.secureUrl);
      showToast('Avatar uploaded successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Avatar upload failed', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAddSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Email and Password are required!', 'error');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      showToast('Firstname and Lastname are required!', 'error');
      return;
    }

    const finalId = workerId || generateWorkerId(firstName || 'WORKER');

    addWorker({
      id: finalId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      otherNames: otherNames.trim(),
      phoneNumber: phoneNumber.trim(),
      ghanaCardId: ghanaCardId.trim(),
      location: location.trim(),
      dateOfEmployment: formatEmploymentDateDisplay(dateOfEmployment),
      notes: notes.trim(),
      email: email.trim(),
      password: password.trim(),
      avatarUrl: avatarUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    showToast('New worker account registered successfully!', 'success');
    setViewMode('list');
    resetForm();
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingWorker) return;

    if (!email.trim() || !firstName.trim() || !lastName.trim()) {
      showToast('Firstname, Lastname and Email are required!', 'error');
      return;
    }

    updateWorker(editingWorker.id, {
      ...editingWorker,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      otherNames: otherNames.trim(),
      phoneNumber: phoneNumber.trim(),
      ghanaCardId: ghanaCardId.trim(),
      location: location.trim(),
      dateOfEmployment: formatEmploymentDateDisplay(dateOfEmployment),
      notes: notes.trim(),
      email: email.trim(),
      password: password.trim() || editingWorker.password,
      avatarUrl: avatarUrl.trim() || editingWorker.avatarUrl,
    });

    showToast('Worker profile updated successfully!', 'success');
    setViewMode('list');
    setEditingWorker(null);
    resetForm();
  };

  const handleContinue = () => {
    if (activeTab === 'personal') {
      if (!firstName.trim() || !lastName.trim()) {
        showToast('Please provide Firstname and Lastname first.', 'error');
        return;
      }
      setActiveTab('contact');
    } else if (activeTab === 'contact') {
      if (!email.trim()) {
        showToast('Please enter an Email Address first.', 'error');
        return;
      }
      setActiveTab('security');
    } else if (activeTab === 'security') {
      if (viewMode === 'add' && !password.trim()) {
        showToast('Please set a password for the worker account.', 'error');
        return;
      }
      setActiveTab('photo');
    } else if (activeTab === 'photo') {
      if (viewMode === 'edit') {
        handleSaveEdit();
      } else {
        handleAddSubmit();
      }
    }
  };

  const handleApplyResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassWorker || !newWorkerPasswordInput.trim()) return;

    resetWorkerPassword(resetPassWorker.id, newWorkerPasswordInput.trim());
    setResetPassWorker(null);
    setNewWorkerPasswordInput('');
    showToast('Worker password reset successfully!', 'success');
  };

  const tabs: { key: 'personal' | 'contact' | 'security' | 'photo'; label: string; icon: React.ReactNode }[] = [
    { key: 'personal', label: 'Personal information', icon: <User className="w-4 h-4" /> },
    { key: 'contact', label: 'Contact & identity', icon: <Mail className="w-4 h-4" /> },
    { key: 'security', label: 'Account & security', icon: <ShieldCheck className="w-4 h-4" /> },
    { key: 'photo', label: 'Avatar & remarks', icon: <ImageIcon className="w-4 h-4" /> },
  ];

  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <div className="space-y-6 pb-12 max-w-6xl mx-auto">
        {/* Breadcrumb & Title */}
        <div className="space-y-1.5">
          <nav className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <button
              onClick={() => {
                setViewMode('list');
                resetForm();
              }}
              className="hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
            >
              Workers
            </button>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {viewMode === 'edit' ? 'Edit worker profile' : 'Register new worker'}
            </span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {viewMode === 'edit' ? 'Edit Worker Profile' : 'Register New Worker Account'}
          </h1>
        </div>

        {/* Main Tabbed Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-visible">
          {/* Horizontal Tabs Bar - matching Add Product page */}
          <div className="flex items-center overflow-x-auto border-b border-slate-200/90 dark:border-slate-800 px-6 sm:px-10 gap-8 sm:gap-12 no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 text-sm sm:text-base whitespace-nowrap border-b-[3px] -mb-[1px] transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'border-brand-600 dark:border-white text-slate-900 dark:text-white font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-bold'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Area */}
          <div className="p-8 sm:p-10 space-y-8 min-h-[560px] pb-36">
            {/* TAB 1: PERSONAL INFORMATION */}
            {activeTab === 'personal' && (
              <div className="space-y-7 max-w-3xl">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Personal Information</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Enter primary legal identity details and employment start date.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Firstname *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Kwame"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Lastname *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Mensah"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Other Names (Optional)
                    </label>
                    <input
                      type="text"
                      value={otherNames}
                      onChange={(e) => setOtherNames(e.target.value)}
                      placeholder="e.g. Kofi"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Date of Employment
                    </label>
                    <CustomDatePicker
                      value={dateOfEmployment}
                      onChange={setDateOfEmployment}
                      placeholder="Select employment date..."
                      presetType="past"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Residential Address / Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. East Legon, Accra - H/No 12"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CONTACT & IDENTITY */}
            {activeTab === 'contact' && (
              <div className="space-y-7 max-w-3xl">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Contact & Identity</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Provide communication channels and official government ID number.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="worker@company.com"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="024 123 4567"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      ID Number
                    </label>
                    <input
                      type="text"
                      value={ghanaCardId}
                      onChange={(e) => setGhanaCardId(e.target.value)}
                      placeholder="e.g. GHA-123456789-0 or ID Number"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ACCOUNT & SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-7 max-w-3xl">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Account & Security</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Configure portal login credentials and generate an official Worker ID.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Login Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showWorkerPassword ? 'text' : 'password'}
                        required={viewMode === 'add'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={viewMode === 'edit' ? 'Leave empty to keep existing password' : 'Enter strong password...'}
                        className="w-full pl-4 pr-11 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWorkerPassword(!showWorkerPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                        title={showWorkerPassword ? 'Hide password' : 'Show password'}
                      >
                        {showWorkerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Worker ID Generation Box */}
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                          Official Worker ID
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Unique system identification number for point-of-sale login and ID card generation.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateId}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-extrabold text-xs rounded-xl transition cursor-pointer shadow-xs shrink-0"
                      >
                        Generate ID
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={workerId}
                        placeholder="Click 'Generate ID' or auto-generate on save"
                        className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 font-mono text-sm font-bold text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700"
                      />
                      {workerId && (
                        <button
                          type="button"
                          onClick={handleCopyId}
                          className="p-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer transition"
                          title="Copy Worker ID"
                        >
                          {copiedId ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: AVATAR & REMARKS */}
            {activeTab === 'photo' && (
              <div className="space-y-7 max-w-3xl">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Avatar & Remarks</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Upload employee profile photo and add optional administrative notes.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Profile Avatar Photo
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-brand-600 dark:border-white bg-slate-100 dark:bg-slate-800 shadow-md flex items-center justify-center">
                          <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-slate-400">Current Avatar</span>
                      </div>

                      <div className="sm:col-span-2 space-y-3">
                        <label
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingAvatar(true);
                          }}
                          onDragLeave={() => setIsDraggingAvatar(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingAvatar(false);
                            const file = e.dataTransfer.files?.[0];
                            handleAvatarFile(file);
                          }}
                          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                            isDraggingAvatar
                              ? 'border-brand-600 dark:border-white bg-brand-50/70 dark:bg-brand-950/40 ring-4 ring-brand-600/10'
                              : isUploadingAvatar
                              ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/30'
                              : 'border-slate-300 dark:border-slate-700 hover:border-brand-600 dark:hover:border-white bg-slate-50/50 dark:bg-slate-800/40'
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploadingAvatar}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              handleAvatarFile(file);
                            }}
                          />
                          {isUploadingAvatar ? (
                            <div className="flex flex-col items-center gap-2 text-slate-900 dark:text-white">
                              <Loader2 className="w-7 h-7 animate-spin" />
                              <span className="text-xs font-bold">Uploading to Cloudinary...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                              <UploadCloud className="w-8 h-8 text-slate-900 dark:text-white" />
                              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                                Click or drag & drop photo
                              </span>
                              <span className="text-xs text-slate-400">PNG, JPG, WEBP up to 5MB</span>
                            </div>
                          )}
                        </label>

                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="Or paste an image URL..."
                            className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Notes / Remarks
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any administrative notes, shift availability, or certifications..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Action Bar - matching Add Product page */}
          <div className="px-6 sm:px-10 py-5 border-t border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setViewMode('list');
                resetForm();
              }}
              className="text-sm font-bold text-slate-700 dark:text-slate-300 underline hover:text-black dark:hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => (viewMode === 'edit' ? handleSaveEdit() : handleAddSubmit())}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="px-7 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-extrabold text-sm transition cursor-pointer shadow-md"
              >
                {activeTab === 'photo' ? (viewMode === 'edit' ? 'Save Changes' : 'Create Worker Account') : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Worker Account Management</h2>
          <p className="text-xs text-slate-500">Register employee profiles, issue IDs, and generate worker credential cards</p>
        </div>

        <button
          onClick={handleStartAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-extrabold text-sm rounded-xl shadow-md transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Workers List Grid / Nice Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Registered Worker Accounts ({workers.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Active staff members with access to POS and inventory systems
            </p>
          </div>
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold font-mono">
            TOTAL: {workers.length}
          </span>
        </div>

        {workers.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Shield className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-600 dark:text-slate-300">
              No worker accounts registered yet
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click the "Add New User" button above to create your first employee account and generate their ID card.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {workers.map((w) => {
              const fullName = `${w.firstName} ${w.lastName} ${w.otherNames || ''}`.trim();

              return (
                <div
                  key={w.id}
                  className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-all group"
                >
                  {/* Worker Profile Info */}
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-brand-600/10 dark:border-white/10 bg-slate-100 dark:bg-slate-800 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <img src={w.avatarUrl} alt={w.firstName} className="w-full h-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-black text-slate-900 dark:text-white truncate">
                          {fullName}
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-md bg-brand-600 text-white dark:bg-white dark:text-black font-extrabold text-[10px] tracking-wider uppercase">
                          {w.role || 'WORKER'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs">
                          ID: {w.id}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{w.email || 'No email provided'}</span>
                        </div>
                        <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                        <span>{w.phoneNumber || 'No phone'}</span>
                        {w.dateOfEmployment && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                            <span className="text-slate-500 dark:text-slate-400">
                              Employed: <strong className="text-slate-700 dark:text-slate-200">{formatEmploymentDateDisplay(w.dateOfEmployment)}</strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Clean Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setDetailWorker(w)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-brand-600 hover:text-white dark:bg-slate-800 dark:hover:bg-white dark:hover:text-black text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    <button
                      onClick={() => handleStartEdit(w)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Info</span>
                    </button>

                    <button
                      onClick={() => setResetPassWorker(w)}
                      className="p-2 bg-slate-100 hover:bg-amber-500 hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
                      title="Reset Password"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setWorkerToRemove(w)}
                      className="p-2 bg-slate-100 hover:bg-rose-600 hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
                      title="Remove Worker Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => generateWorkerCardPDF(w, settings, true)}
                      className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                      title="Download Worker Card PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Details Popup Modal */}
      {detailWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Worker Profile Details</h3>
              <button onClick={() => setDetailWorker(null)} className="text-slate-400 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-brand-600 dark:border-white shadow-md">
                <img src={detailWorker.avatarUrl} alt={detailWorker.firstName} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-black text-lg text-slate-900 dark:text-white">
                {detailWorker.firstName} {detailWorker.lastName} {detailWorker.otherNames}
              </h4>
              <span className="inline-block font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                ID: {detailWorker.id}
              </span>
            </div>

            <div className="space-y-2 text-xs border-t border-b border-slate-100 dark:border-slate-800 py-3">
              <div className="flex justify-between"><span className="text-slate-400">Email:</span> <span className="font-bold">{detailWorker.email}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Password:</span> <span className="font-mono font-bold text-slate-900 dark:text-white" title="Passwords are hashed and never displayed — use Reset Password to set a new one">••••••••</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Phone:</span> <span className="font-bold">{detailWorker.phoneNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">ID Number:</span> <span className="font-bold">{detailWorker.ghanaCardId}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Residential Address:</span> <span className="font-bold">{detailWorker.location}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Employment Date:</span> <span className="font-bold">{formatEmploymentDateDisplay(detailWorker.dateOfEmployment)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Notes:</span> <span>{detailWorker.notes || 'None'}</span></div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => generateWorkerCardPDF(detailWorker, settings, true)}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => {
                  setWorkerToRemove(detailWorker);
                  setDetailWorker(null);
                }}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white dark:bg-rose-950/40 dark:hover:bg-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Remove User"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPassWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Reset Worker Password</h3>
              <button onClick={() => setResetPassWorker(null)} className="text-slate-400 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Admin Direct Reset: Enter a new password for worker <strong>{resetPassWorker.firstName}</strong>. No previous password required.
            </p>

            <form onSubmit={handleApplyResetPassword} className="space-y-3">
              <div className="relative">
                <input
                  type={showResetWorkerPassword ? 'text' : 'password'}
                  required
                  value={newWorkerPasswordInput}
                  onChange={(e) => setNewWorkerPasswordInput(e.target.value)}
                  placeholder="Type new password..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowResetWorkerPassword(!showResetWorkerPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                  title={showResetWorkerPassword ? 'Hide password' : 'Show password'}
                >
                  {showResetWorkerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-extrabold text-sm rounded-xl shadow-md transition cursor-pointer"
              >
                Apply New Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Remove Worker Confirmation Modal */}
      {workerToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Remove User Account</span>
              </div>
              <button onClick={() => setWorkerToRemove(null)} className="text-slate-400 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently remove <strong>{workerToRemove.firstName} {workerToRemove.lastName}</strong> (ID: <span className="font-mono">{workerToRemove.id}</span>)?
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will revoke their POS access and remove their profile from the system.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setWorkerToRemove(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeWorker(workerToRemove.id);
                  setWorkerToRemove(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
