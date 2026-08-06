import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  Receipt,
  Eye,
  Download,
  X,
  Calendar,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShoppingBag,
  Clock,
} from 'lucide-react';
import { generateOrderReceiptPDF } from '../../utils/pdfGenerator';
import { Order } from '../../types';
import { CustomSelect } from '../common/CustomSelect';
import { DateRangeFilter, matchesDateFilter, DateFilterValue } from '../common/DateRangeFilter';

export const UserTransactions: React.FC = () => {
  const { orders, settings, currentUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({
    preset: 'all',
    specificDate: '',
    startDate: '',
    endDate: '',
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'Completed' | 'Pending' | 'Declined'>('all');
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const currencySymbol = settings.currency || 'GH₵';

  // Filter orders for this worker
  const myOrders = useMemo(() => {
    return orders.filter((o) => {
      const isMyOrder = currentUser ? o.workerId === currentUser.id : true;
      const matchesSearch =
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.customerPhone && o.customerPhone.includes(searchTerm));

      const matchesStatus = statusFilter === 'all' || (statusFilter === 'Completed' ? true : false);

      const matchesTime = matchesDateFilter(o.date || o.createdAt, dateFilter);

      return isMyOrder && matchesSearch && matchesStatus && matchesTime;
    });
  }, [orders, currentUser, searchTerm, dateFilter, statusFilter]);

  // Metric cards calculations
  const totalTransactionsCount = myOrders.length;
  const totalRevenue = myOrders.reduce((acc, order) => acc + order.totalAmount, 0);
  const averageOrderValue = totalTransactionsCount > 0 ? totalRevenue / totalTransactionsCount : 0;
  const completedCount = myOrders.length; // all completed in POS

  // Pagination logic
  const totalPages = Math.ceil(myOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return myOrders.slice(start, start + itemsPerPage);
  }, [myOrders, currentPage, itemsPerPage]);

  const getInitials = (name?: string) => {
    if (!name || !name.trim()) return 'WC';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name?: string) => {
    const colors = [
      'bg-brand-100 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300',
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300',
      'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
      'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300',
      'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
      'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300',
    ];
    if (!name) return colors[0];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Manage and audit your completed POS sales and receipt records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Live Sync Active</span>
          </span>
        </div>
      </div>

      {/* Top 2 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Total Transactions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-brand-600/10 dark:bg-lime-950/60 text-brand-600 dark:text-lime-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase">
              {dateFilter.preset === 'all' ? 'All Time' : dateFilter.preset === 'today' ? 'Today' : dateFilter.preset === 'yesterday' ? 'Yesterday' : dateFilter.preset === 'specific' ? dateFilter.specificDate : 'Date Range'}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Transactions</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalTransactionsCount}
            </div>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-brand-600/10 dark:bg-lime-950/60 text-brand-600 dark:text-lime-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase">
              {dateFilter.preset === 'all' ? 'All Time' : dateFilter.preset === 'today' ? 'Today' : dateFilter.preset === 'yesterday' ? 'Yesterday' : dateFilter.preset === 'specific' ? dateFilter.specificDate : 'Date Range'}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Sales Revenue</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">
              {currencySymbol} {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Transactions</h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
              {myOrders.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name, phone or ID..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Date Range & Presets Filter */}
            <DateRangeFilter
              value={dateFilter}
              onChange={(val) => {
                setDateFilter(val);
                setCurrentPage(1);
              }}
              className="w-full sm:w-56"
            />

            {/* Status Filter pill */}
            <CustomSelect
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val as any);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'Status: All' },
                { value: 'Completed', label: 'Completed' },
              ]}
            />
          </div>
        </div>

        {/* Desktop Table View */}
        {paginatedOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Receipt className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No transactions found</p>
            <p className="text-xs text-slate-400">
              {searchTerm || dateFilter.preset !== 'all'
                ? 'Try adjusting your search or date filter criteria.'
                : 'Completed POS sales will automatically appear in this record.'}
            </p>
            {(searchTerm || dateFilter.preset !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter({ preset: 'all', specificDate: '', startDate: '', endDate: '' });
                  setStatusFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-brand-600/10 text-brand-600 text-xs font-extrabold hover:bg-brand-600 hover:text-white transition cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/60 dark:bg-slate-800/40">
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Receipt ID</th>
                    <th className="py-3.5 px-4">Created on</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {paginatedOrders.map((order) => {
                    const avatarColor = getAvatarColor(order.customerName);
                    const initials = getInitials(order.customerName);
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                      >
                        {/* Customer */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-xs font-black shrink-0 shadow-xs`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white truncate">
                                {order.customerName || 'Walk-in Customer'}
                              </div>
                              <div className="text-[11px] text-slate-400 font-normal truncate">
                                {order.customerPhone || 'No contact phone'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-4 font-black text-slate-900 dark:text-white whitespace-nowrap">
                          <span className="text-emerald-600 dark:text-emerald-400 mr-0.5">+</span>
                          {currencySymbol} {order.totalAmount.toFixed(2)}
                        </td>

                        {/* Status pill */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Completed
                          </span>
                        </td>

                        {/* Receipt ID */}
                        <td className="py-4 px-4 font-mono font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          #{order.id}
                        </td>

                        {/* Created on */}
                        <td className="py-4 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{order.date}</div>
                          <div className="text-[10px] text-slate-400">{order.time || '12:00 PM'}</div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewOrder(order)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-600 hover:text-white dark:bg-slate-800 dark:hover:bg-brand-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                              title="View Order Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>

                            <button
                              onClick={() => generateOrderReceiptPDF(order, settings, true)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                              title="Download PDF Receipt"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedOrders.map((order) => {
                const avatarColor = getAvatarColor(order.customerName);
                const initials = getInitials(order.customerName);
                return (
                  <div key={order.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-xs font-black shrink-0`}>
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {order.customerName || 'Walk-in Customer'}
                          </div>
                          <div className="text-xs text-slate-400">
                            #{order.id} • {order.customerPhone}
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] font-extrabold">
                        Completed
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Total Paid</div>
                        <div className="text-base font-black text-slate-900 dark:text-white">
                          {currencySymbol} {order.totalAmount.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-400 font-medium">
                        <div>{order.date}</div>
                        <div className="text-[10px]">{order.time || '12:00 PM'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setPreviewOrder(order)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-brand-600 hover:text-white dark:bg-slate-800 dark:hover:bg-brand-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => generateOrderReceiptPDF(order, settings, true)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF Receipt</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination & Table Footer */}
            <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
              <div>
                Showing{' '}
                <strong className="text-slate-900 dark:text-white">
                  {Math.min((currentPage - 1) * itemsPerPage + 1, myOrders.length)}
                </strong>{' '}
                -{' '}
                <strong className="text-slate-900 dark:text-white">
                  {Math.min(currentPage * itemsPerPage, myOrders.length)}
                </strong>{' '}
                of <strong className="text-slate-900 dark:text-white">{myOrders.length}</strong> entries
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-3 py-1.5 rounded-lg bg-brand-600 text-white font-bold">
                  {currentPage}
                </div>

                {totalPages > 1 && currentPage < totalPages && (
                  <>
                    <span className="px-1 text-slate-400">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Receipt Preview Modal */}
      {previewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Receipt Preview</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">ORDER ID: {previewOrder.id}</p>
              </div>

              <button
                onClick={() => setPreviewOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Generated Receipt Design Preview Box */}
            <div className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-emerald-500/30 dark:border-slate-700 space-y-3 text-xs shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  {settings.companyLogoUrl ? (
                    <img
                      src={settings.companyLogoUrl}
                      alt="Logo"
                      className="w-6 h-6 rounded-md object-cover border border-emerald-500/20"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-md bg-brand-600 text-white font-black text-xs flex items-center justify-center">
                      POS
                    </div>
                  )}
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {settings.shopName || 'Beauty Salon'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium text-right">
                  <div>Date: {previewOrder.date}</div>
                  <div>Time: {previewOrder.time || '12:00 PM'}</div>
                </div>
              </div>

              <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
                <div>
                  Customer: <strong>{previewOrder.customerName}</strong> ({previewOrder.customerPhone})
                </div>
              </div>

              {/* Items List */}
              <div className="pt-2 space-y-1.5">
                <div className="font-bold text-slate-500 uppercase text-[10px]">Purchased Items</div>
                {previewOrder.items.map((i, index) => (
                  <div key={index} className="flex items-start justify-between gap-3 text-slate-800 dark:text-slate-200 font-medium">
                    <span className="min-w-0 flex-1 break-words pr-2">
                      {index + 1}. {i.productName} <span className="text-slate-500 dark:text-slate-400 font-semibold">(x{i.quantity})</span>
                    </span>
                    <span className="shrink-0 font-bold text-right">
                      {currencySymbol} {i.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-sm text-slate-900 dark:text-white bg-emerald-500/10 dark:bg-emerald-500/20 p-2.5 rounded-xl">
                <span>TOTAL:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {currencySymbol} {previewOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => generateOrderReceiptPDF(previewOrder, settings, true)}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

