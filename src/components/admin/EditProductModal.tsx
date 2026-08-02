import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  X,
  Tag,
  MapPin,
  UploadCloud,
  Loader2,
  Trash2,
  Check,
  Package,
  Layers,
  DollarSign,
  FileText,
  Info,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { uploadToCloudinary } from '../../utils/cloudinary';

type ProductTab = 'basic' | 'vital' | 'variations' | 'images' | 'descriptions';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose }) => {
  const {
    updateProduct,
    deleteProduct,
    categories,
    storeLocations,
    addCategory,
    removeCategory,
    addStoreLocation,
    removeStoreLocation,
    settings,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<ProductTab>('basic');

  // Basic Information State
  const [name, setName] = useState(product.name || '');
  const [supplierInfo, setSupplierInfo] = useState(product.supplierInfo || '');
  const [categoryId, setCategoryId] = useState(product.categoryId || categories[0]?.id || '');
  const [locationId, setLocationId] = useState(product.locationId || storeLocations[0]?.id || '');

  // Vital Information State
  const [quantityInStock, setQuantityInStock] = useState(String(product.quantityInStock ?? 1));
  const [expirationDate, setExpirationDate] = useState(product.expirationDate || '');

  // Variations and Price State
  const [costPrice, setCostPrice] = useState(String(product.costPrice ?? 0));
  const [sellingPrice, setSellingPrice] = useState(String(product.sellingPrice ?? 0));
  const [variations, setVariations] = useState<string[]>(
    product.variant
      ? product.variant
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  );
  const [newVariationInput, setNewVariationInput] = useState('');

  // Images State (Cloudinary URLs)
  const [mainImages, setMainImages] = useState<string[]>(
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : []
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  // Descriptions State
  const [description, setDescription] = useState(product.description || '');

  // Category & Location Create Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  // Delete Confirm State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currencySymbol = settings.currency || 'GH₵';

  const tabs: { key: ProductTab; label: string }[] = [
    { key: 'basic', label: 'Basic information' },
    { key: 'vital', label: 'Vital information' },
    { key: 'variations', label: 'Variations & price' },
    { key: 'images', label: 'Images' },
    { key: 'descriptions', label: 'Descriptions' },
  ];

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

    const parsedQty = parseInt(quantityInStock, 10) || 0;
    const newInitialQty = Math.max(product.initialQuantity || 1, parsedQty);

    updateProduct(product.id, {
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
      quantityInStock: parsedQty,
      initialQuantity: newInitialQty,
      imageUrl: mainImages[0] || undefined,
      images: mainImages,
    });

    onClose();
  };

  const handleDeleteProduct = () => {
    deleteProduct(product.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-slate-900 dark:text-white truncate">
                Edit Product: {product.name}
              </h2>
              <p className="text-xs text-slate-400 font-medium truncate">
                ID: {product.id} • {product.categoryName || 'General Category'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Horizontal Tabs Bar */}
        <div className="flex items-center overflow-x-auto border-b border-slate-200/80 dark:border-slate-800 px-6 gap-6 shrink-0 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`py-3.5 text-sm whitespace-nowrap border-b-[3px] -mb-[1px] transition-all cursor-pointer ${
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
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Basic information</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Update primary identity and categorization details.
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
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Vital information</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage stock quantity and expiration / shelf life tracking.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
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
                    placeholder="Select expiration date..."
                    presetType="future"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VARIATIONS AND PRICE */}
          {activeTab === 'variations' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Variations and price</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Update wholesale cost, retail selling price, and variation options.
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
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Product Image</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload or replace the product photo.
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
                  className={`relative rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-800/60 border-2 min-h-[300px] w-full flex items-center justify-center shadow-sm group transition-all ${
                    isDraggingImage
                      ? 'border-brand-600 dark:border-white bg-brand-50/70 dark:bg-brand-950/40 ring-4 ring-brand-600/10'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <img
                    src={mainImages[0]}
                    alt="Product preview"
                    className="w-full h-72 object-contain bg-slate-50 dark:bg-slate-900"
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
                  className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px] w-full select-none ${
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
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
                      <div className="w-16 h-16 rounded-3xl bg-slate-200/80 dark:bg-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 mb-1 shadow-xs">
                        <UploadCloud className="w-8 h-8 text-slate-900 dark:text-white" />
                      </div>
                      <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                        Drop product image or click to browse
                      </span>
                      <span className="text-xs text-slate-400">Supports PNG, JPG, WEBP up to 5MB</span>
                    </div>
                  )}
                </label>
              )}
            </div>
          )}

          {/* TAB 5: DESCRIPTIONS */}
          {activeTab === 'descriptions' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Descriptions</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Update descriptive copy and supplier notes.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Product Description
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed description of the product..."
                  className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-white transition-all shadow-2xs placeholder:text-slate-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-600 dark:text-rose-400 font-extrabold text-xs transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Product</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-3 py-1.5 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300">Are you sure?</span>
                <button
                  type="button"
                  onClick={handleDeleteProduct}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg transition"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-lg transition"
                >
                  No
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-extrabold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProduct}
              className="px-6 py-2.5 bg-brand-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Add New Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newCategoryName.trim()) {
                    addCategory(newCategoryName.trim());
                    setNewCategoryName('');
                    setShowCategoryModal(false);
                    showToast('Category created', 'success');
                  }
                }}
                className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Add New Store Location</h3>
              <button onClick={() => setShowLocationModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Store Location Name"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newLocationName.trim()) {
                    addStoreLocation(newLocationName.trim());
                    setNewLocationName('');
                    setShowLocationModal(false);
                    showToast('Store Location created', 'success');
                  }
                }}
                className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
