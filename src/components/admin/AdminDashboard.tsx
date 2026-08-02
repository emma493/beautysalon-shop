import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  Layers,
  Users,
  Package,
  AlertCircle,
  Receipt,
  ChevronRight,
} from 'lucide-react';
import { Order } from '../../types';
import { CustomSelect } from '../common/CustomSelect';

const TIME_FILTER_OPTIONS = ['Today', 'This Week', 'This Month', 'Last Month', 'This Year', 'All Time'] as const;
type TimeRangeFilter = (typeof TIME_FILTER_OPTIONS)[number];
const selectOptions = TIME_FILTER_OPTIONS.map((opt) => ({ value: opt, label: opt }));

const isOrderInTimeRange = (order: Order, timeRange: TimeRangeFilter): boolean => {
  if (timeRange === 'All Time') return true;

  const now = new Date();
  let orderDate: Date | null = null;

  if (order.createdAt) {
    orderDate = new Date(order.createdAt);
  } else if (order.date) {
    const parts = order.date.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        orderDate = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      } else if (parts[2].length === 4) {
        orderDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }
    if (!orderDate || isNaN(orderDate.getTime())) {
      orderDate = new Date(order.date);
    }
  }

  if (!orderDate || isNaN(orderDate.getTime())) return true;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (timeRange === 'Today') {
    return orderDate >= startOfToday;
  }
  if (timeRange === 'This Week') {
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(startOfToday.getTime() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) * 86400000);
    return orderDate >= startOfWeek;
  }
  if (timeRange === 'This Month') {
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  }
  if (timeRange === 'Last Month') {
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return orderDate >= firstDayLastMonth && orderDate <= lastDayLastMonth;
  }
  if (timeRange === 'This Year') {
    return orderDate.getFullYear() === now.getFullYear();
  }

  return true;
};

export const AdminDashboard: React.FC = () => {
  const { orders, products, settings, setCurrentTab, currentUser } = useStore();
  const [salesFilter, setSalesFilter] = useState<TimeRangeFilter>('All Time');
  const [incomeFilter, setIncomeFilter] = useState<TimeRangeFilter>('All Time');
  const [visitorFilter, setVisitorFilter] = useState<TimeRangeFilter>('All Time');
  const [topProductsFilter, setTopProductsFilter] = useState<TimeRangeFilter>('All Time');

  const currencySymbol = settings.currency || 'GH₵';
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Filter orders based on time range filters
  const salesOrders = orders.filter((o) => isOrderInTimeRange(o, salesFilter));
  const incomeOrders = orders.filter((o) => isOrderInTimeRange(o, incomeFilter));
  const visitorOrders = orders.filter((o) => isOrderInTimeRange(o, visitorFilter));
  const topProductOrders = orders.filter((o) => isOrderInTimeRange(o, topProductsFilter));

  // Calculated Sales Amount
  const salesAmount = salesOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  // Calculated Profit/Income
  let incomeAmount = 0;
  incomeOrders.forEach((o) => {
    o.items?.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const cost = item.costPrice !== undefined ? item.costPrice : (prod ? prod.costPrice : item.unitPrice * 0.7);
      incomeAmount += (item.unitPrice - cost) * item.quantity;
    });
  });

  // Visitors / Orders count
  const totalVisitorCount = visitorOrders.length;

  // Top Products List based on selected time filter
  const productSalesCount: Record<string, number> = {};
  topProductOrders.forEach((o) => {
    o.items?.forEach((item) => {
      productSalesCount[item.productId] = (productSalesCount[item.productId] || 0) + item.quantity;
    });
  });

  // Sort products by sales in period or fallback to stock/index
  const sortedProducts = [...products].sort((a, b) => {
    const countA = productSalesCount[a.id] || 0;
    const countB = productSalesCount[b.id] || 0;
    return countB - countA;
  });

  const topProductsList = sortedProducts.slice(0, 4).map((p, idx) => {
    const bgColors = ['bg-sky-100/80 dark:bg-sky-950/40', 'bg-amber-100/80 dark:bg-amber-950/40', 'bg-cyan-100/80 dark:bg-cyan-950/40', 'bg-emerald-100/80 dark:bg-emerald-950/40'];
    const count = productSalesCount[p.id] || 0;
    return {
      id: p.id,
      name: p.name,
      items: count > 0 ? `${count} Sold` : `${p.quantityInStock} in Stock`,
      bgColor: bgColors[idx % bgColors.length],
      imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150',
    };
  });

  // Low Stock Items
  const stockAlerts = products
    .filter((p) => p.quantityInStock <= 10)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      name: p.name,
      items: `${p.quantityInStock} Remaining Items`,
      imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1608248597261-e4d0450cbf1c?w=150',
    }));

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 dark:text-white tracking-tight">
            Welcome back{currentUser?.firstName ? `, ${currentUser.firstName}` : ''}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">{todayLabel} · Here's how the store is doing</p>
        </div>
      </div>

      {/* ROW 1: 3 STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full min-w-0">
        {/* Card 1: Total Sales */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/60 border-t-4 border-t-brand-500 shadow-xs flex flex-col justify-between min-w-0 w-full overflow-hidden space-y-3">
          <div className="flex items-center justify-between gap-2 w-full min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-300 shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">Total Sales</span>
            </div>
            <CustomSelect
              value={salesFilter}
              onChange={(val) => setSalesFilter(val as TimeRangeFilter)}
              options={selectOptions}
              align="right"
              size="sm"
            />
          </div>

          <div className="w-full min-w-0 overflow-hidden">
            <div
              className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate w-full"
              title={`${currencySymbol}${salesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            >
              {currencySymbol}{salesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400 mt-1 truncate">
              {salesOrders.length} {salesOrders.length === 1 ? 'order' : 'orders'} in {salesFilter.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Card 2: Total Income */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/60 border-t-4 border-t-gold-400 shadow-xs flex flex-col justify-between min-w-0 w-full overflow-hidden space-y-3">
          <div className="flex items-center justify-between gap-2 w-full min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center text-gold-600 dark:text-gold-300 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">Total Income</span>
            </div>
            <CustomSelect
              value={incomeFilter}
              onChange={(val) => setIncomeFilter(val as TimeRangeFilter)}
              options={selectOptions}
              align="right"
              size="sm"
            />
          </div>

          <div className="w-full min-w-0 overflow-hidden">
            <div
              className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate w-full"
              title={`${currencySymbol}${incomeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            >
              {currencySymbol}{incomeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400 mt-1 truncate">
              Total profits (selling - cost) in {incomeFilter.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Card 3: Total Orders / Visitors */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/60 border-t-4 border-t-emerald-400 shadow-xs flex flex-col justify-between min-w-0 w-full overflow-hidden space-y-3">
          <div className="flex items-center justify-between gap-2 w-full min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">Total Orders</span>
            </div>
            <CustomSelect
              value={visitorFilter}
              onChange={(val) => setVisitorFilter(val as TimeRangeFilter)}
              options={selectOptions}
              align="right"
              size="sm"
            />
          </div>

          <div className="w-full min-w-0 overflow-hidden">
            <div
              className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate w-full"
              title={totalVisitorCount.toLocaleString('en-US')}
            >
              {totalVisitorCount.toLocaleString('en-US')}
            </div>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400 mt-1 truncate">
              Total orders in {visitorFilter.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* ROW 2: SPLIT SECTION - TOP SELLING PRODUCTS (LEFT) & LOW STOCK ITEMS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full min-w-0">
        {/* Left Column: Top Selling Products */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/60 shadow-xs flex flex-col justify-between space-y-6 min-w-0 w-full overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">Top Selling Products</h3>
              <CustomSelect
                value={topProductsFilter}
                onChange={(val) => setTopProductsFilter(val as TimeRangeFilter)}
                options={selectOptions}
                align="right"
                size="sm"
              />
            </div>

            {/* Product List Items */}
            <div className="space-y-4 pt-4">
              {topProductsList.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No products available.</p>
              ) : (
                topProductsList.map((item) => (
                  <div key={item.id} className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition min-w-0">
                    <div className={`w-12 h-12 rounded-2xl ${item.bgColor} p-1.5 flex items-center justify-center shrink-0`}>
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain rounded-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{item.name}</h4>
                      <p className="text-[11px] font-medium text-slate-400 truncate">{item.items}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 truncate">Total Products: {products.length}</span>
            <button
              onClick={() => setCurrentTab('products')}
              className="flex items-center gap-1 text-xs font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-3.5 py-1.5 rounded-full hover:bg-slate-200 transition shrink-0"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Low Stock Items */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/60 shadow-xs flex flex-col justify-between space-y-6 min-w-0 w-full overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">Low Stock Items</h3>
              <button
                onClick={() => setCurrentTab('products')}
                className="flex items-center gap-1 text-xs font-extrabold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition shrink-0"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              {stockAlerts.length === 0 ? (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                  <Package className="w-4 h-4 shrink-0" />
                  <span>All products have adequate stock level.</span>
                </div>
              ) : (
                stockAlerts.map((sa) => (
                  <div key={sa.id} className="flex items-center gap-3.5 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/40 p-1 flex items-center justify-center shrink-0">
                      <img src={sa.imageUrl} alt={sa.name} className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight truncate">{sa.name}</h4>
                      <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mt-0.5 truncate">{sa.items}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
