import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Download,
  User,
  Phone,
  DollarSign,
  Package,
  X,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Receipt,
} from 'lucide-react';
import { generateOrderReceiptPDF } from '../../utils/pdfGenerator';
import { Order } from '../../types';

interface UserOrderProps {
  onOrderComplete?: () => void;
}

export const UserOrder: React.FC<UserOrderProps> = ({ onOrderComplete }) => {
  const {
    products,
    categories,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    completeOrder,
    settings,
    orders,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [step, setStep] = useState<'cart' | 'customer' | 'payment' | 'completed'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const activeCompletedOrder = completedOrder || (orders && orders.length > 0 ? orders[0] : null);

  const currencySymbol = settings.currency || 'GH₵';

  const categoryList = ['All products', ...categories.map((c) => c.name)];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.variant && p.variant.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat =
      selectedCategory === 'All products' ||
      selectedCategory === 'All' ||
      p.categoryName === selectedCategory;
    return p.quantityInStock > 0 && matchesSearch && matchesCat;
  });

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartTotal = subtotal;

  const handlePaid = () => {
    const name = customerName.trim() || 'Walk-in Customer';
    const phone = customerPhone.trim() || 'N/A';
    const newOrder = completeOrder(name, phone);
    if (newOrder) {
      setCompletedOrder(newOrder);
      setStep('completed');
    }
  };

  const handleDownloadPDF = () => {
    if (activeCompletedOrder) {
      generateOrderReceiptPDF(activeCompletedOrder, settings, true);
    }
  };

  const resetOrderFlow = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCompletedOrder(null);
    clearCart();
    setStep('cart');
  };

  return (
    <div className="space-y-6">
      {/* Top Numbered Stepper Navigation Header */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto">
        <button
          onClick={() => setStep('cart')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition text-xs font-extrabold shrink-0 cursor-pointer ${
            step === 'cart'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
            step === 'cart' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
          }`}>1</span>
          <span>1. Select Items</span>
        </button>

        <span className="text-slate-300 dark:text-slate-700 font-bold shrink-0">→</span>

        <button
          onClick={() => { if (cart.length > 0) setStep('customer'); }}
          disabled={cart.length === 0}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition text-xs font-extrabold shrink-0 ${
            step === 'customer'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          } ${cart.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
            step === 'customer' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
          }`}>2</span>
          <span>2. Customer Info</span>
        </button>

        <span className="text-slate-300 dark:text-slate-700 font-bold shrink-0">→</span>

        <button
          onClick={() => { if (cart.length > 0) setStep('payment'); }}
          disabled={cart.length === 0}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition text-xs font-extrabold shrink-0 ${
            step === 'payment'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          } ${cart.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
            step === 'payment' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
          }`}>3</span>
          <span>3. Payment Overview</span>
        </button>

        <span className="text-slate-300 dark:text-slate-700 font-bold shrink-0">→</span>

        <button
          onClick={() => setStep('completed')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition text-xs font-extrabold shrink-0 cursor-pointer ${
            step === 'completed'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
            step === 'completed' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
          }`}>4</span>
          <span>4. Complete</span>
        </button>
      </div>

      {/* STEP 1: Select Items & Cart */}
      {step === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Column: Products Catalog */}
          <div className="lg:col-span-8 space-y-5">
            {/* Search Input Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by product..."
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-2xs"
                />
              </div>
            </div>

            {/* Horizontal Category Filter Pills Bar */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {categoryList.map((cat) => {
                const isActive =
                  selectedCategory === cat ||
                  (cat === 'All products' && selectedCategory === 'All');

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center text-slate-400 space-y-2">
                  <Package className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No products available</p>
                  <p className="text-xs text-slate-400">Try adjusting your search query or selecting a different category pill above.</p>
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const cartItem = cart.find((i) => i.product.id === p.id);
                  const currentQty = cartItem ? cartItem.quantity : 0;

                  return (
                    <div
                      key={p.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-3.5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 space-y-3 group"
                    >
                      {/* Top Row: Stock Pill Badge */}
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-brand-600/10 text-brand-600 dark:bg-lime-950/80 dark:text-lime-300 font-extrabold text-[11px] rounded-full">
                          {p.quantityInStock} Stock
                        </span>
                      </div>

                      {/* Product Image Container */}
                      <div className="w-full h-36 bg-brand-50 dark:bg-slate-800/80 rounded-2xl p-3 flex items-center justify-center overflow-hidden">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>

                      {/* Info & Pricing */}
                      <div className="space-y-1 px-0.5">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="text-slate-900 dark:text-white font-black">
                            {currencySymbol}{p.sellingPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Button: Add to Order OR Quantity Stepper */}
                      {currentQty > 0 ? (
                        <div className="w-full py-1.5 px-3 bg-brand-600 text-white rounded-xl flex items-center justify-between font-extrabold text-xs shadow-2xs">
                          <button
                            onClick={() => updateCartQuantity(p.id, currentQty - 1)}
                            className="p-1 hover:bg-brand-700 rounded-lg transition"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-black px-2">{currentQty}</span>
                          <button
                            onClick={() => updateCartQuantity(p.id, currentQty + 1)}
                            className="p-1 hover:bg-brand-700 rounded-lg transition"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(p, 1)}
                          className="w-full py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-brand-600 dark:hover:border-lime-500 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-brand-600" />
                          <span>Add to Order</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Order Details Drawer Panel (Reference Image Match) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between shadow-2xs space-y-5 sticky top-4">
            <div className="space-y-4 flex-1">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Order details</span>
                  {cart.length > 0 && (
                    <span className="w-5 h-5 bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 text-[11px] font-black rounded-full flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </h3>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Clear Cart"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Cart List */}
              {cart.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Your cart is empty</p>
                  <p className="text-[11px] text-slate-400">Click "+ Add to Order" on products to begin</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-none">
                  {cart.map((item) => {
                    return (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between gap-3 p-2 bg-brand-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-xs"
                      >
                        {/* Thumbnail */}
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl p-1 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        {/* Title & Price */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h5 className="font-extrabold text-slate-900 dark:text-white truncate">
                            {item.product.name}
                          </h5>
                          <div className="flex items-center gap-1.5 font-bold text-[11px]">
                            <span className="text-slate-900 dark:text-slate-200 font-extrabold">
                              {currencySymbol}{item.product.sellingPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Stepper Controls */}
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1.5 font-black text-xs text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Trash Button */}
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary Total Calculation */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="space-y-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-between text-slate-900 dark:text-white">
                  <span className="text-sm font-black">Total</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {currencySymbol}{subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Continue Order Action Button */}
              <button
                disabled={cart.length === 0}
                onClick={() => setStep('customer')}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-black text-sm rounded-2xl shadow-lg shadow-lime-900/10 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Customer Details Form */}
      {step === 'customer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-5xl mx-auto">
          {/* Left Column: Customer Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-600/10 text-brand-600 dark:bg-lime-950/80 dark:text-lime-300 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Customer Information</h3>
                <p className="text-xs text-slate-400 font-medium">Provide customer details to attach to this receipt</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Customer Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Customer Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name e.g. John K. Mensah"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                  />
                </div>
              </div>

              {/* Phone Number Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone number e.g. 0542859612"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-2xl transition cursor-pointer"
              >
                ← Back to Order
              </button>
              <button
                type="button"
                onClick={() => setStep('payment')}
                className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-lime-900/10 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Order Items Summary Card */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Order Summary</h4>
              <span className="px-2.5 py-1 bg-brand-600/10 text-brand-600 dark:bg-lime-950 dark:text-lime-300 text-[11px] font-black rounded-full">
                {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-none">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl p-1 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain" />
                    ) : (
                      <Package className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{item.product.name}</p>
                    <p className="text-[11px] font-medium text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {currencySymbol}{item.totalPrice.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Total Amount</span>
              <span className="text-lg font-black text-brand-600 dark:text-lime-400">
                {currencySymbol}{subtotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Payment Overview & Completion */}
      {step === 'payment' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-5xl mx-auto">
          {/* Left Column: Customer Details & Item List */}
          <div className="lg:col-span-7 space-y-5">
            {/* Customer Details Summary Banner */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-600/10 text-brand-600 dark:bg-lime-950/80 dark:text-lime-300 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Customer Details</h3>
                    <p className="text-xs text-slate-400 font-medium">Recipient of receipt & invoice</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('customer')}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold rounded-xl transition cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block text-[11px]">Customer Name</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 block truncate">
                    {customerName}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block text-[11px]">Phone Number</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 block truncate">
                    {customerPhone}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Purchased List */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-600" />
                  <span>Items Purchased ({cart.length})</span>
                </h4>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-extrabold text-xs rounded-full">
                  Cash Payment
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {cart.map((i, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl p-1 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700">
                        {i.product.imageUrl ? (
                          <img src={i.product.imageUrl} alt={i.product.name} className="w-full h-full object-contain" />
                        ) : (
                          <Package className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 dark:text-white truncate">{i.product.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {currencySymbol}{i.product.sellingPrice.toFixed(2)} × {i.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white text-sm shrink-0">
                      {currencySymbol}{i.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Breakdown & Complete Sale */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6 sticky top-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Payment Summary</h3>
              <p className="text-xs text-slate-400 font-medium">Final transaction breakdown</p>
            </div>

            <div className="space-y-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              <div className="flex justify-between items-center">
                <span>Subtotal ({cart.length} items)</span>
                <span className="text-slate-900 dark:text-white font-extrabold">
                  {currencySymbol}{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                <span>Payment Method</span>
                <span className="font-extrabold">Cash</span>
              </div>

              <div className="p-4 bg-brand-600/10 dark:bg-lime-950/60 rounded-2xl border border-lime-200 dark:border-lime-900/50 flex items-center justify-between mt-4">
                <span className="text-xs font-black text-slate-900 dark:text-lime-200">Total Amount Due</span>
                <span className="text-xl font-black text-brand-600 dark:text-lime-300">
                  {currencySymbol}{cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handlePaid}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-lime-900/10 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
              >
                <DollarSign className="w-5 h-5" />
                <span>Complete Sale & Collect Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('customer')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-2xl transition cursor-pointer"
              >
                ← Back to Customer Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED STEP - CLEAN MODERN DOWNLOAD & SALE LOGGED VIEW */}
      {step === 'completed' && activeCompletedOrder && (
        <div className="max-w-2xl mx-auto py-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            {/* Header Section matching UserProducts detail modal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-brand-600/10 dark:bg-emerald-950/60 p-2.5 flex items-center justify-center shrink-0 border border-brand-600/20 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-8 h-8 text-brand-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Payment Received & Sale Logged!
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-slate-400">Order Reference</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-brand-600/10 dark:bg-emerald-950/80 text-brand-600 dark:text-emerald-300 font-mono font-bold text-xs">
                      #{activeCompletedOrder.id}
                    </span>
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800/60 shrink-0 self-start sm:self-center">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Completed</span>
              </span>
            </div>

            {/* 2-Column Detail Grid matching UserProducts.tsx detail modal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1 border border-slate-100/80 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Total Amount Paid</span>
                <div className="font-extrabold text-lg text-brand-600 dark:text-emerald-400">
                  {currencySymbol} {activeCompletedOrder.totalAmount.toFixed(2)}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1 border border-slate-100/80 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Payment Status</span>
                <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Paid & Logged</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1 border border-slate-100/80 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Customer Name</span>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {activeCompletedOrder.customerName || 'Walk-in Customer'}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1 border border-slate-100/80 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Contact Phone</span>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {activeCompletedOrder.customerPhone || 'N/A'}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1 border border-slate-100/80 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Transaction Timestamp</span>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {activeCompletedOrder.date} at {activeCompletedOrder.time}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1 border border-slate-100/80 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Items Purchased</span>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {activeCompletedOrder.items.reduce((acc, i) => acc + i.quantity, 0)} item(s) across {activeCompletedOrder.items.length} product(s)
                </div>
              </div>

              <div className="sm:col-span-2 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1 border border-slate-100/80 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">PDF Receipt Reference</span>
                <div className="font-mono text-xs text-slate-700 dark:text-slate-300 font-bold truncate" title={activeCompletedOrder.pdfFileName}>
                  {activeCompletedOrder.pdfFileName}
                </div>
              </div>
            </div>

            {/* Purchased Items Summary Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2.5 border border-slate-100/80 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-700 pb-2">
                <span>Purchased Items Summary</span>
                <span>Qty / Total</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeCompletedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200/40 dark:border-slate-800 last:border-0">
                    <div className="min-w-0 pr-3">
                      <div className="font-extrabold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </div>
                      <div className="text-slate-400 text-[11px] font-medium">
                        {item.variant || 'Standard'} ({currencySymbol}{item.unitPrice.toFixed(2)} each)
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-slate-900 dark:text-white">
                        {currencySymbol}{item.totalPrice.toFixed(2)}
                      </div>
                      <div className="text-slate-400 text-[10px] font-bold">
                        x{item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons matching Products page professional style */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={resetOrderFlow}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Start New Order</span>
                </button>
              </div>

              {onOrderComplete && (
                <button
                  type="button"
                  onClick={onOrderComplete}
                  className="w-full py-2.5 text-slate-500 hover:text-brand-600 dark:hover:text-emerald-400 font-extrabold text-xs transition cursor-pointer inline-flex items-center justify-center gap-1"
                >
                  <span>View All Transactions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED STEP FALLBACK (When no order completed yet) */}
      {step === 'completed' && !activeCompletedOrder && (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center space-y-4 my-8 shadow-lg">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">No Order Completed Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Please add items to cart and complete checkout to view the order receipt.</p>
          </div>
          <button
            type="button"
            onClick={() => setStep('cart')}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            Start New Order
          </button>
        </div>
      )}
    </div>
  );
};
