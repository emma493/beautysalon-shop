import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Plus,
  X,
  Tag,
  MapPin,
  FolderPlus,
  Check,
  ChevronRight,
  UploadCloud,
  Image as ImageIcon,
  DollarSign,
  FileText,
  Info,
  Layers,
  Loader2,
  Minus,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { uploadToCloudinary } from '../../utils/cloudinary';

type ProductTab = 'basic' | 'vital' | 'variations' | 'images' | 'descriptions';

export const AdminAddProduct: React.FC = () => {
  const {
    addProduct,
    categories,
    storeLocations,
    addCategory,
    removeCategory,
    addStoreLocation,
    removeStoreLocation,
    settings,
    setCurrentTab,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<ProductTab>('basic');

  // Ensure we always start on 'Basic information' when opening Add Product
  useEffect(() => {
    setActiveTab('basic');
  }, []);

  // Basic Information State
  const [name, setName] = useState('');
  const [supplierInfo, setSupplierInfo] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [locationId, setLocationId] = useState(storeLocations[0]?.id || '');

  // Vital Information State
  const [quantityInStock, setQuantityInStock] = useState('50');
  const [expirationDate, setExpirationDate] = useState('');
  const [sku, setSku] = useState('');

  // Variations and Price State
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [variations, setVariations] = useState<string[]>([]);
  const [newVariationInput, setNewVariationInput] = useState('');

  // Images State (Cloudinary URLs)
  const [mainImages, setMainImages] = useState<string[]>([]);
  const [colourImages, setColourImages] = useState<Record<string, string[]>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const handleSingleImageFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast(`"${file.name}" exceeds 5MB size limit.`, 'error');
      return;
    }
    setIsUploadingImage(true);
    try {
      const res = await uploadToCloudinary(file);
      setMainImages([res.secureUrl]);
      showToast('Product image uploaded successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Descriptions State
  const [description, setDescription] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');

  // Category & Location Create Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  const currencySymbol = settings.currency || 'GH₵';

  const handleAddVariation = () => {
    const clean = newVariationInput.trim();
    if (!clean) return;
    if (variations.includes(clean)) {
      showToast(`Variation "${clean}" is already added.`, 'error');
      return;
    }
    setVariations((prev) => [...prev, clean]);
    setNewVariationInput('');
  };

  const handleRemoveVariation = (val: string) => {
    setVariations((prev) => prev.filter((v) => v !== val));
  };

  const handleSaveProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a Product Name in Basic Information tab.', 'error');
      setActiveTab('basic');
      return;
    }

    const selectedCat = categories.find((c) => c.id === categoryId);
    const selectedLoc = storeLocations.find((l) => l.id === locationId);

    addProduct({
      name: name.trim(),
      variant: variations.join(', ') || 'Standard',
      description: description.trim() || 'No description provided.',
      supplierInfo: supplierInfo.trim() || 'General Supplier',
      expirationDate,
      categoryId: categoryId || 'general',
      categoryName: selectedCat ? selectedCat.name : 'General',
      locationId: locationId || 'unassigned',
      locationName: selectedLoc ? selectedLoc.name : 'Unassigned',
      costPrice: parseFloat(costPrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      quantityInStock: parseInt(quantityInStock, 10) || 1,
      imageUrl: mainImages[0] || undefined,
      images: mainImages,
      colourImages: {},
    });

    setCurrentTab('Products');
  };

  const tabs: { key: ProductTab; label: string }[] = [
    { key: 'basic', label: 'Basic information' },
    { key: 'vital', label: 'Vital information' },
    { key: 'variations', label: 'Variations and price' },
    { key: 'images', label: 'Images' },
    { key: 'descriptions', label: 'Descriptions' },
  ];

  const handleContinue = () => {
    const idx = tabs.findIndex((t) => t.key === activeTab);
    if (idx < tabs.length - 1) {
      setActiveTab(tabs[idx + 1].key);
    } else {
      handleSaveProduct();
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Breadcrumb & Title */}
      <div className="space-y-1.5">
        <nav className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <button
            onClick={() => setCurrentTab('Products')}
            className="hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            Products
          </button>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="font-extrabold text-slate-900 dark:text-white">Add new product</span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Add new product
        </h1>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Horizontal Tabs Bar - matching screenshot */}
        <div className="flex items-center overflow-x-auto border-b border-slate-200/90 dark:border-slate-800 px-6 sm:px-10 gap-8 sm:gap-12 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 text-sm sm:text-base whitespace-nowrap border-b-[3px] -mb-[1px] transition-all cursor-pointer ${
                  isActive
                    ? 'border-brand-600 dark:border-white text-slate-900 dark:text-white font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-bold'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="p-8 sm:p-10 space-y-8 min-h-[460px]">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-7 max-w-3xl">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Basic information</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Enter primary identity details for this product item.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cotton Casual T-Shirt"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Supplier / Brand Info
                  </label>
                  <input
                    type="text"
                    value={supplierInfo}
                    onChange={(e) => setSupplierInfo(e.target.value)}
                    placeholder="e.g. Zara Essentials"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Category Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Category *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(true)}
                        className="text-xs font-extrabold text-brand-600 hover:underline cursor-pointer"
                      >
                        + Add new
                      </button>
                    </div>
                    <CustomSelect
                      value={categoryId}
                      onChange={setCategoryId}
                      options={categories.map((c) => ({ value: c.id, label: c.name }))}
                      icon={<Tag className="w-4 h-4 text-slate-400 shrink-0" />}
                      className="w-full"
                      buttonClassName="w-full"
                      onDeleteOption={(id) => {
                        removeCategory(id);
                        if (categoryId === id) setCategoryId('');
                      }}
                    />
                  </div>

                  {/* Store Location Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Store Location *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowLocationModal(true)}
                        className="text-xs font-extrabold text-brand-600 hover:underline cursor-pointer"
                      >
                        + Add new
                      </button>
                    </div>
                    <CustomSelect
                      value={locationId}
                      onChange={setLocationId}
                      options={storeLocations.map((l) => ({ value: l.id, label: l.name }))}
                      icon={<MapPin className="w-4 h-4 text-slate-400 shrink-0" />}
                      className="w-full"
                      buttonClassName="w-full"
                      onDeleteOption={(id) => {
                        removeStoreLocation(id);
                        if (locationId === id) setLocationId('');
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VITAL INFORMATION */}
          {activeTab === 'vital' && (
            <div className="space-y-7 max-w-3xl">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Vital information</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage inventory counts, expiry tracking, and barcodes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Initial Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantityInStock}
                    onChange={(e) => setQuantityInStock(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Expiration Date / Shelf Life
                  </label>
                  <CustomDatePicker
                    value={expirationDate}
                    onChange={setExpirationDate}
                    placeholder="Select expiration / shelf life date..."
                    presetType="future"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VARIATIONS AND PRICE */}
          {activeTab === 'variations' && (
            <div className="space-y-7 max-w-3xl">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Variations and price</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Define wholesale cost, retail selling price, and colour options.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Cost Price ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Selling Price ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Product Variations Manager */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                    Product Variations / Options
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Add variation options applicable to this item (e.g. Size M, 500g, Navy Blue, Standard).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {variations.map((val) => (
                    <span
                      key={val}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-extrabold border border-slate-200 dark:border-slate-700 shadow-2xs"
                    >
                      <Tag className="w-3 h-3 text-slate-900 dark:text-white" />
                      <span>{val}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariation(val)}
                        className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Remove variation"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {variations.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No variations added. Standard will be applied.</span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 max-w-md">
                  <input
                    type="text"
                    value={newVariationInput}
                    onChange={(e) => setNewVariationInput(e.target.value)}
                    placeholder="Add variation (e.g. Size M, 500g, Navy Blue)"
                    className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariation}
                    className="px-5 py-3 bg-brand-600 hover:bg-brand-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-extrabold text-sm rounded-xl transition cursor-pointer shadow-xs"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IMAGES */}
          {activeTab === 'images' && (
            <div className="space-y-7 max-w-3xl">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Product Image *</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Upload 1 product image. This primary photo will be displayed across inventory, catalog, and point-of-sale screens.
                </p>
              </div>

              {mainImages.length > 0 ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingImage(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingImage(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingImage(false);
                    const file = e.dataTransfer.files?.[0];
                    handleSingleImageFile(file);
                  }}
                  className={`relative rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-800/60 border-2 min-h-[380px] w-full flex items-center justify-center shadow-sm group transition-all ${
                    isDraggingImage
                      ? 'border-brand-600 dark:border-white bg-brand-50/70 dark:bg-brand-950/40 ring-4 ring-brand-600/10'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <img
                    src={mainImages[0]}
                    alt="Product preview"
                    className="w-full h-96 object-contain bg-slate-50 dark:bg-slate-900"
                  />
                  <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-black/70 text-white text-xs font-extrabold backdrop-blur-xs">
                    Primary Product Image
                  </div>
                  {isDraggingImage && (
                    <div className="absolute inset-0 bg-brand-600/80 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2 z-20">
                      <UploadCloud className="w-12 h-12 animate-bounce" />
                      <span className="text-base font-extrabold">Drop image to replace</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="px-5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-extrabold hover:bg-slate-100 transition cursor-pointer shadow-md">
                      {isUploadingImage ? 'Uploading...' : 'Replace Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingImage}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handleSingleImageFile(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setMainImages([])}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold hover:bg-rose-700 transition cursor-pointer shadow-md"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingImage(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingImage(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingImage(false);
                    const file = e.dataTransfer.files?.[0];
                    handleSingleImageFile(file);
                  }}
                  className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[380px] w-full select-none ${
                    isDraggingImage
                      ? 'border-brand-600 dark:border-white bg-brand-50/70 dark:bg-brand-950/40 ring-4 ring-brand-600/10 scale-[1.01]'
                      : isUploadingImage
                      ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/30'
                      : 'border-slate-300 dark:border-slate-700 hover:border-brand-600 dark:hover:border-white bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleSingleImageFile(file);
                      e.target.value = '';
                    }}
                  />
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-3 text-slate-900 dark:text-white">
                      <Loader2 className="w-10 h-10 animate-spin" />
                      <span className="text-sm font-bold">Uploading to Cloudinary...</span>
                    </div>
                  ) : isDraggingImage ? (
                    <div className="flex flex-col items-center gap-3 text-slate-900 dark:text-white">
                      <UploadCloud className="w-12 h-12 animate-bounce" />
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                        Drop your image here!
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Release to instantly upload
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
                      <div className="w-16 h-16 rounded-3xl bg-slate-200/80 dark:bg-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 mb-1 shadow-xs">
                        <UploadCloud className="w-8 h-8 text-slate-900 dark:text-white" />
                      </div>
                      <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                        Click or drag & drop to upload product image
                      </span>
                      <span className="text-xs text-slate-400 font-medium max-w-xs">
                        Supports PNG, JPG, or WEBP (Max 5MB). Only 1 high-resolution image is needed.
                      </span>
                    </div>
                  )}
                </label>
              )}

              {/* Paste URL alternative */}
              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="url"
                  placeholder="Or paste an image URL..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        setMainImages([val]);
                        e.currentTarget.value = '';
                        showToast('Image URL added!', 'success');
                      }
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    const val = input?.value.trim();
                    if (val) {
                      setMainImages([val]);
                      input.value = '';
                      showToast('Image URL added!', 'success');
                    }
                  }}
                  className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-sm rounded-xl transition cursor-pointer"
                >
                  Set URL
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: DESCRIPTIONS */}
          {activeTab === 'descriptions' && (
            <div className="space-y-7 max-w-3xl">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Descriptions</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Provide detailed product text and key features.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Product Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter comprehensive description of fabric, fit, style, and care instructions..."
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Key Features / Bullet Points
                  </label>
                  <textarea
                    rows={3}
                    value={keyFeatures}
                    onChange={(e) => setKeyFeatures(e.target.value)}
                    placeholder="• 100% Organic Cotton&#10;• Relaxed fit for casual wear&#10;• Machine washable"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar - matching screenshot */}
        <div className="px-6 sm:px-10 py-5 border-t border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentTab('Products')}
            className="text-sm font-bold text-slate-700 dark:text-slate-300 underline hover:text-black dark:hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSaveProduct()}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="px-7 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-extrabold text-sm transition cursor-pointer shadow-md"
            >
              {activeTab === 'descriptions' ? 'Save Product' : 'Continue'}
            </button>
          </div>
        </div>
      </div>

      {/* Category Creation & Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">Manage Categories</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newCategoryName.trim()) {
                  addCategory(newCategoryName.trim());
                  setNewCategoryName('');
                }
              }}
              className="space-y-3"
            >
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Add New Category</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Hair Care, Beverages"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
                >
                  + Add
                </button>
              </div>
            </form>

            {/* List of existing categories with (-) delete button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Existing Categories ({categories.length})</label>
              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {categories.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No categories created yet.</p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <span className="truncate">{cat.name}</span>
                      <button
                        type="button"
                        title={`Delete category ${cat.name}`}
                        onClick={() => {
                          removeCategory(cat.id);
                          if (categoryId === cat.id) setCategoryId('');
                        }}
                        className="w-6 h-6 flex items-center justify-center bg-red-100 hover:bg-red-500 text-red-600 hover:text-white dark:bg-red-950/60 dark:hover:bg-red-600 dark:text-red-400 dark:hover:text-white rounded-lg transition cursor-pointer shrink-0 ml-2"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs rounded-xl transition cursor-pointer text-slate-700 dark:text-slate-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Creation & Management Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">Manage Store Locations</h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newLocationName.trim()) {
                  addStoreLocation(newLocationName.trim());
                  setNewLocationName('');
                }
              }}
              className="space-y-3"
            >
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Add New Location</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="e.g. Shelf A1, Cold Storage"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
                >
                  + Add
                </button>
              </div>
            </form>

            {/* List of existing locations with (-) delete button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Existing Store Locations ({storeLocations.length})</label>
              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {storeLocations.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No locations created yet.</p>
                ) : (
                  storeLocations.map((loc) => (
                    <div
                      key={loc.id}
                      className="flex items-center justify-between px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <span className="truncate">{loc.name}</span>
                      <button
                        type="button"
                        title={`Delete location ${loc.name}`}
                        onClick={() => {
                          removeStoreLocation(loc.id);
                          if (locationId === loc.id) setLocationId('');
                        }}
                        className="w-6 h-6 flex items-center justify-center bg-red-100 hover:bg-red-500 text-red-600 hover:text-white dark:bg-red-950/60 dark:hover:bg-red-600 dark:text-red-400 dark:hover:text-white rounded-lg transition cursor-pointer shrink-0 ml-2"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs rounded-xl transition cursor-pointer text-slate-700 dark:text-slate-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
