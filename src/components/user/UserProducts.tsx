import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  Filter,
  Eye,
  X,
  Package,
  ArrowUpRight,
  LayoutGrid,
  List,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { Product } from '../../types';
import { CustomSelect } from '../common/CustomSelect';

export const UserProducts: React.FC = () => {
  const { products, categories, storeLocations, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const currencySymbol = settings.currency || 'GH₵';

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.variant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesCat = true;
    if (selectedCategory === 'most_purchased') {
      matchesCat = p.initialQuantity - p.quantityInStock > 5;
    } else if (selectedCategory === 'low_stock') {
      matchesCat = p.quantityInStock < p.initialQuantity / 2;
    } else if (selectedCategory !== 'all') {
      matchesCat = p.categoryId === selectedCategory;
    }

    const matchesLoc = selectedLocation === 'all' || p.locationId === selectedLocation;

    return matchesSearch && matchesCat && matchesLoc;
  });

  const getQuantityIndicator = (qty: number, initialQty: number) => {
    if (qty <= 0) {
      return { color: 'bg-rose-500 text-rose-500', label: 'Out of Stock', barWidth: '0%', text: 'Out of Stock' };
    }
    if (qty >= initialQty && initialQty > 0) {
      return { color: 'bg-emerald-500 text-emerald-500', label: 'Refilled', barWidth: '100%', text: 'Full Stock' };
    }
    const half = initialQty / 2;
    if (qty >= half) {
      const pct = Math.min(100, Math.round((qty / initialQty) * 100));
      return { color: 'bg-amber-400 text-amber-500', label: 'More than half left', barWidth: `${pct}%`, text: 'In Stock' };
    } else {
      const pct = Math.min(100, Math.round((qty / initialQty) * 100));
      return { color: 'bg-orange-500 text-orange-500', label: 'Less than half left', barWidth: `${pct}%`, text: 'Low Stock' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Products</h2>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Explore salon items, beauty supplies, and stock levels</p>
        </div>

        {/* Search & Layout Toggle Controls */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-2xs"
            />
          </div>

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`p-2.5 rounded-full border transition ${
              showFilters || selectedLocation !== 'all'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
            title="Toggle Location Filters"
          >
            <Filter className="w-4 h-4" />
          </button>

          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-full shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition ${
                viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition ${
                viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Location Filter Dropdown (Collapsible) */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">Store Location:</span>
            <CustomSelect
              value={selectedLocation}
              onChange={setSelectedLocation}
              options={[
                { value: 'all', label: 'All Store Locations' },
                ...storeLocations.map((l) => ({ value: l.id, label: l.name })),
              ]}
              icon={<MapPin className="w-3.5 h-3.5 text-brand-600" />}
            />
          </div>
        </div>
      )}

      {/* Horizontal Category Pill Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
          }`}
        >
          All Products
        </button>

        <button
          onClick={() => setSelectedCategory('most_purchased')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition shrink-0 ${
            selectedCategory === 'most_purchased'
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
          }`}
        >
          Most Purchased
        </button>

        <button
          onClick={() => setSelectedCategory('low_stock')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition shrink-0 ${
            selectedCategory === 'low_stock'
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
          }`}
        >
          Low Stock
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* PRODUCTS DISPLAY SECTION */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800 space-y-3">
          <Package className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No products found</p>
          <p className="text-xs text-slate-400">Try adjusting your search query or selecting a different category pill above.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (Ecomora Style Mockup) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((p) => {
            const soldCount = Math.max(0, p.initialQuantity - p.quantityInStock);

            return (
              <div
                key={p.id}
                onClick={() => setDetailProduct(p)}
                className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200/80 dark:border-slate-800 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between group space-y-3"
              >
                {/* Image Card Container */}
                <div className="relative w-full aspect-square bg-brand-50 dark:bg-slate-800/80 rounded-2xl p-4 flex items-center justify-center overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                  )}

                  {/* Corner Arrow Icon Button */}
                  <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white dark:bg-slate-700/90 shadow-2xs flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-700 dark:text-white" />
                  </div>
                </div>

                {/* Info Section */}
                <div className="px-1 space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate leading-snug">
                    {p.name}
                  </h3>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {currencySymbol}{p.sellingPrice.toFixed(2)}
                  </div>
                </div>

                {/* Bottom Stock Stats */}
                <div className="px-1 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 font-semibold">Stock: </span>
                    <span>{p.quantityInStock}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Sold: </span>
                    <span>{soldCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredProducts.map((p) => {
            const indicator = getQuantityIndicator(p.quantityInStock, p.initialQuantity);
            const soldCount = Math.max(0, p.initialQuantity - p.quantityInStock);

            return (
              <div
                key={p.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {p.name} <span className="text-xs font-normal text-slate-400">({p.variant || 'Standard'})</span>
                    </h4>
                    <p className="text-xs text-slate-400">Category: {p.categoryName || 'General'} | Sold: {soldCount}</p>
                  </div>
                </div>

                <div className="w-full sm:w-44 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Stock: {p.quantityInStock}</span>
                    <span className={`text-[10px] font-bold uppercase ${indicator.color.split(' ')[1]}`}>
                      {indicator.text}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${indicator.color.split(' ')[0]}`} style={{ width: indicator.barWidth }} />
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Unit Price</div>
                    <div className="text-base font-black text-brand-600 dark:text-emerald-400">
                      {currencySymbol}{p.sellingPrice.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => setDetailProduct(p)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-brand-600 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Popup Modal */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-slate-800 p-1 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                  {detailProduct.imageUrl ? (
                    <img src={detailProduct.imageUrl} alt={detailProduct.name} className="w-full h-full object-contain rounded-xl" />
                  ) : (
                    <Package className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{detailProduct.name}</h3>
                  <p className="text-xs font-semibold text-slate-400">{detailProduct.variant || 'Standard Variant'}</p>
                </div>
              </div>

              <button
                onClick={() => setDetailProduct(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-0.5">
                <span className="text-slate-400 font-semibold">Selling Price</span>
                <div className="font-extrabold text-base text-brand-600 dark:text-emerald-400">
                  {currencySymbol}{detailProduct.sellingPrice.toFixed(2)}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-0.5">
                <span className="text-slate-400 font-semibold">Category</span>
                <div className="font-extrabold text-slate-900 dark:text-white">{detailProduct.categoryName || 'General'}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-0.5">
                <span className="text-slate-400 font-semibold">Stock Quantity</span>
                <div className="font-extrabold text-slate-900 dark:text-white">{detailProduct.quantityInStock} Units</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-0.5">
                <span className="text-slate-400 font-semibold">Total Sold</span>
                <div className="font-extrabold text-slate-900 dark:text-white">
                  {Math.max(0, detailProduct.initialQuantity - detailProduct.quantityInStock)} Units
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-0.5">
                <span className="text-slate-400 font-semibold">Store Location</span>
                <div className="font-extrabold text-slate-900 dark:text-white">{detailProduct.locationName || 'Unassigned'}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-0.5">
                <span className="text-slate-400 font-semibold">Expiration Date</span>
                <div className="font-extrabold text-slate-900 dark:text-white">{detailProduct.expirationDate || 'N/A'}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1 text-xs">
              <span className="text-slate-400 font-semibold">Product Description</span>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {detailProduct.description || 'No additional description provided.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
