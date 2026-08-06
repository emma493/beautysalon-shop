import JSZip from 'jszip';
import { Order, Product, UserProfile, LogEntry, SystemSettings } from '../types';

export async function generateSnapshotZip(
  targetYear: string,
  orders: Order[],
  products: Product[],
  users: UserProfile[],
  logs: LogEntry[],
  settings: SystemSettings
): Promise<Blob> {
  const zip = new JSZip();

  const folderName = `Company_Snapshot_${targetYear}`;
  const rootFolder = zip.folder(folderName) || zip;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // 1. JSON Data files
  const metadata = {
    snapshotYear: targetYear,
    snapshotDate: `31st December ${targetYear}`,
    exportedAt: new Date().toISOString(),
    shopName: settings.shopName || 'Beauty Salon',
    companyAddress: settings.address || settings.companyAddress,
    companyPhone: settings.phone || settings.companyPhone,
    companyEmail: settings.email || settings.companyEmail,
    currencySymbol: settings.currency || 'GH₵',
    totalOrdersCount: orders.length,
    totalRevenue,
    totalProductsCount: products.length,
    totalWorkersCount: users.length,
  };

  rootFolder.file('metadata.json', JSON.stringify(metadata, null, 2));
  rootFolder.file('orders.json', JSON.stringify(orders, null, 2));
  rootFolder.file('inventory_products.json', JSON.stringify(products, null, 2));
  rootFolder.file('active_workers.json', JSON.stringify(users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    email: u.email,
    location: u.location,
    dateOfEmployment: u.dateOfEmployment,
  })), null, 2));
  rootFolder.file('activity_logs.json', JSON.stringify(logs, null, 2));

  // 2. README.txt
  rootFolder.file('README.txt', `${settings.shopName.toUpperCase()} - COMPLETE OFFLINE SNAPSHOT ARCHIVE (${targetYear})
=====================================================================================
Snapshot Date: 31st December ${targetYear}
Generated On: ${new Date().toLocaleString()}
Company: ${settings.shopName}
Total Orders Preserved: ${orders.length}
Total Sales Revenue Preserved: ${settings.currency || 'GH₵'} ${totalRevenue.toFixed(2)}

OFFLINE WEB PORTAL INSTRUCTIONS:
--------------------------------
1. Double click and open "index.html" in any web browser (Chrome, Edge, Safari, Firefox).
2. No internet connection or web server is required.
3. You can navigate through Transactions, Products, Workers, and System Logs.
4. Search, filter by date range, specific date, worker name, customer phone, or receipt ID.

ARCHIVE DATA FILES:
- index.html: Standalone offline company portal application
- metadata.json: High-level snapshot summary and shop details
- orders.json: Complete transaction history and receipt records
- inventory_products.json: Inventory catalog and stock state
- active_workers.json: Staff accounts list
- activity_logs.json: Detailed audit logs
=====================================================================================
`);

  // 3. Complete Offline Interactive Application HTML (index.html)
  const offlineAppHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.shopName} - Offline Data Snapshot (${targetYear})</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <div id="app" class="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
    <!-- Header Banner -->
    <header class="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
          POS
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">${settings.shopName}</h1>
            <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-extrabold uppercase">
              Offline Snapshot ${targetYear}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Archived on 31st December ${targetYear} · ${orders.length} total transaction records preserved
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
        <button onclick="switchTab('transactions')" id="tab-transactions" class="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
          Transactions (${orders.length})
        </button>
        <button onclick="switchTab('products')" id="tab-products" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white">
          Products (${products.length})
        </button>
        <button onclick="switchTab('workers')" id="tab-workers" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white">
          Staff (${users.length})
        </button>
        <button onclick="switchTab('logs')" id="tab-logs" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white">
          Logs (${logs.length})
        </button>
      </div>
    </header>

    <!-- METRICS BAR -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div class="text-xs font-bold text-slate-400">Total Offline Orders</div>
        <div class="text-2xl font-black text-white mt-1" id="metric-orders-count">${orders.length}</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div class="text-xs font-bold text-slate-400">Total Sales Revenue</div>
        <div class="text-2xl font-black text-amber-400 mt-1" id="metric-revenue">${settings.currency || 'GH₵'} ${totalRevenue.toFixed(2)}</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div class="text-xs font-bold text-slate-400">Active Staff Accounts</div>
        <div class="text-2xl font-black text-white mt-1">${users.length}</div>
      </div>
    </div>

    <!-- MAIN VIEW PANELS -->
    <main class="bg-slate-900 border border-slate-800 rounded-3xl p-6 min-h-[500px]">
      <!-- TRANSACTIONS TAB -->
      <section id="panel-transactions" class="space-y-4">
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <h2 class="text-lg font-bold text-white">Archived Transactions</h2>

          <div class="flex flex-wrap items-center gap-2">
            <input type="text" id="tx-search" oninput="renderTransactions()" placeholder="Search name, phone or ID..." className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 w-full sm:w-56" />

            <select id="tx-preset" onchange="renderTransactions()" class="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white">
              <option value="all">Preset: All Time</option>
              <option value="today">Preset: Today</option>
              <option value="yesterday">Preset: Yesterday</option>
              <option value="range">Date Range...</option>
            </select>

            <div id="range-inputs" class="hidden flex items-center gap-1">
              <input type="date" id="tx-start-date" onchange="renderTransactions()" class="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
              <span class="text-xs text-slate-400">to</span>
              <input type="date" id="tx-end-date" onchange="renderTransactions()" class="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white" />
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th class="p-3">Order ID</th>
                <th class="p-3">Customer</th>
                <th class="p-3">Phone</th>
                <th class="p-3">Amount</th>
                <th class="p-3">Date & Time</th>
                <th class="p-3">Staff</th>
                <th class="p-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody id="tx-tbody" class="divide-y divide-slate-800/60 text-slate-200">
            </tbody>
          </table>
        </div>
      </section>

      <!-- PRODUCTS TAB -->
      <section id="panel-products" class="hidden space-y-4">
        <h2 class="text-lg font-bold text-white pb-2 border-b border-slate-800">Archived Products Catalog</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th class="p-3">Product Name</th>
                <th class="p-3">Category</th>
                <th class="p-3">Stock Level</th>
                <th class="p-3">Cost Price</th>
                <th class="p-3">Selling Price</th>
              </tr>
            </thead>
            <tbody id="products-tbody" class="divide-y divide-slate-800/60 text-slate-200">
            </tbody>
          </table>
        </div>
      </section>

      <!-- WORKERS TAB -->
      <section id="panel-workers" class="hidden space-y-4">
        <h2 class="text-lg font-bold text-white pb-2 border-b border-slate-800">Staff & Users Directory</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th class="p-3">Worker ID</th>
                <th class="p-3">Name</th>
                <th class="p-3">Role</th>
                <th class="p-3">Email</th>
              </tr>
            </thead>
            <tbody id="workers-tbody" class="divide-y divide-slate-800/60 text-slate-200">
            </tbody>
          </table>
        </div>
      </section>

      <!-- LOGS TAB -->
      <section id="panel-logs" class="hidden space-y-4">
        <h2 class="text-lg font-bold text-white pb-2 border-b border-slate-800">System Logs</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th class="p-3">Timestamp</th>
                <th class="p-3">User</th>
                <th class="p-3">Action</th>
                <th class="p-3">Details</th>
              </tr>
            </thead>
            <tbody id="logs-tbody" class="divide-y divide-slate-800/60 text-slate-200">
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>

  <!-- RECEIPT MODAL -->
  <div id="receipt-modal" class="fixed inset-0 bg-black/80 backdrop-blur-xs hidden flex items-center justify-center p-4 z-50">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="font-bold text-white text-base">Receipt Detail</h3>
        <button onclick="closeReceiptModal()" class="text-slate-400 hover:text-white font-bold">✕</button>
      </div>
      <div id="receipt-content" class="text-xs space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
      </div>
      <button onclick="closeReceiptModal()" class="w-full py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs">
        Close
      </button>
    </div>
  </div>

  <script>
    const RAW_ORDERS = ${JSON.stringify(orders)};
    const RAW_PRODUCTS = ${JSON.stringify(products)};
    const RAW_WORKERS = ${JSON.stringify(users)};
    const RAW_LOGS = ${JSON.stringify(logs)};
    const CURRENCY = "${settings.currency || 'GH₵'}";

    function switchTab(tab) {
      ['transactions', 'products', 'workers', 'logs'].forEach(t => {
        document.getElementById('panel-' + t).classList.add('hidden');
        document.getElementById('tab-' + t).className = "px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white";
      });
      document.getElementById('panel-' + tab).classList.remove('hidden');
      document.getElementById('tab-' + tab).className = "px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shadow-md";
    }

    function renderTransactions() {
      const search = document.getElementById('tx-search').value.toLowerCase();
      const preset = document.getElementById('tx-preset').value;
      const rangeBox = document.getElementById('range-inputs');
      
      if (preset === 'range') {
        rangeBox.classList.remove('hidden');
      } else {
        rangeBox.classList.add('hidden');
      }

      const startDate = document.getElementById('tx-start-date').value;
      const endDate = document.getElementById('tx-end-date').value;

      const filtered = RAW_ORDERS.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(search) ||
          (o.customerName && o.customerName.toLowerCase().includes(search)) ||
          (o.customerPhone && o.customerPhone.includes(search));

        let matchesDate = true;
        const oDateStr = o.date || (o.createdAt ? o.createdAt.split('T')[0] : '');

        if (preset === 'today') {
          const today = new Date().toISOString().split('T')[0];
          matchesDate = oDateStr === today;
        } else if (preset === 'yesterday') {
          const y = new Date();
          y.setDate(y.getDate() - 1);
          matchesDate = oDateStr === y.toISOString().split('T')[0];
        } else if (preset === 'range') {
          if (startDate && oDateStr < startDate) matchesDate = false;
          if (endDate && oDateStr > endDate) matchesDate = false;
        }

        return matchesSearch && matchesDate;
      });

      const tbody = document.getElementById('tx-tbody');
      tbody.innerHTML = filtered.map(o => \`
        <tr class="hover:bg-slate-800/40 transition">
          <td class="p-3 font-mono font-bold text-amber-400">#\${o.id}</td>
          <td class="p-3 font-bold text-white">\${o.customerName || 'Walk-in Customer'}</td>
          <td class="p-3 text-slate-400">\${o.customerPhone || 'N/A'}</td>
          <td class="p-3 font-black text-amber-400">\${CURRENCY} \${o.totalAmount.toFixed(2)}</td>
          <td class="p-3 text-slate-400">\${o.date || ''} \${o.time || ''}</td>
          <td class="p-3 text-slate-300">\${o.workerName || 'Staff'}</td>
          <td class="p-3 text-right">
            <button onclick='viewReceipt("\${o.id}")' class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold text-[11px] text-amber-400 transition">
              View
            </button>
          </td>
        </tr>
      \`).join('');

      document.getElementById('metric-orders-count').innerText = filtered.length;
      const rev = filtered.reduce((s, x) => s + (x.totalAmount || 0), 0);
      document.getElementById('metric-revenue').innerText = CURRENCY + ' ' + rev.toFixed(2);
    }

    function viewReceipt(id) {
      const order = RAW_ORDERS.find(o => o.id === id);
      if (!order) return;
      const itemsHtml = (order.items || []).map(i => \`
        <div class="flex justify-between py-1 border-b border-slate-800">
          <span>\${i.productName} (x\${i.quantity})</span>
          <span class="font-bold">\${CURRENCY} \${i.totalPrice.toFixed(2)}</span>
        </div>
      \`).join('');

      document.getElementById('receipt-content').innerHTML = \`
        <div class="font-bold text-white text-sm pb-2 border-b border-slate-800">Receipt #\${order.id}</div>
        <div>Customer: <strong>\${order.customerName || 'Walk-in'}</strong> (\${order.customerPhone || '—'})</div>
        <div>Staff Member: <strong>\${order.workerName || 'Staff'}</strong></div>
        <div>Date: <strong>\${order.date} \${order.time || ''}</strong></div>
        <div class="pt-2">
          <div class="font-bold text-slate-400 pb-1">Items:</div>
          \${itemsHtml}
        </div>
        <div class="pt-2 flex justify-between font-black text-amber-400 text-sm">
          <span>TOTAL:</span>
          <span>\${CURRENCY} \${order.totalAmount.toFixed(2)}</span>
        </div>
      \`;

      document.getElementById('receipt-modal').classList.remove('hidden');
    }

    function closeReceiptModal() {
      document.getElementById('receipt-modal').classList.add('hidden');
    }

    function renderProducts() {
      const tbody = document.getElementById('products-tbody');
      tbody.innerHTML = RAW_PRODUCTS.map(p => \`
        <tr class="hover:bg-slate-800/40">
          <td class="p-3 font-bold text-white">\${p.name}</td>
          <td class="p-3 text-slate-400">\${p.category || 'General'}</td>
          <td class="p-3 font-bold \${p.quantityInStock <= 10 ? 'text-amber-400' : 'text-emerald-400'}">\${p.quantityInStock}</td>
          <td class="p-3 text-slate-400">\${CURRENCY} \${(p.costPrice || 0).toFixed(2)}</td>
          <td class="p-3 font-bold text-amber-400">\${CURRENCY} \${(p.sellingPrice || 0).toFixed(2)}</td>
        </tr>
      \`).join('');
    }

    function renderWorkers() {
      const tbody = document.getElementById('workers-tbody');
      tbody.innerHTML = RAW_WORKERS.map(w => \`
        <tr class="hover:bg-slate-800/40">
          <td class="p-3 font-mono font-bold text-slate-400">\${w.id}</td>
          <td class="p-3 font-bold text-white">\${w.firstName} \${w.lastName || ''}</td>
          <td class="p-3 uppercase text-[10px] font-extrabold text-amber-400">\${w.role}</td>
          <td class="p-3 text-slate-400">\${w.email}</td>
        </tr>
      \`).join('');
    }

    function renderLogs() {
      const tbody = document.getElementById('logs-tbody');
      tbody.innerHTML = RAW_LOGS.map(l => \`
        <tr class="hover:bg-slate-800/40">
          <td class="p-3 text-slate-400">\${l.timestamp ? l.timestamp.replace('T', ' ').slice(0, 19) : l.date}</td>
          <td class="p-3 font-bold text-white">\${l.userName || 'System'}</td>
          <td class="p-3 font-bold text-amber-400 uppercase text-[10px]">\${l.action}</td>
          <td class="p-3 text-slate-300">\${l.details}</td>
        </tr>
      \`).join('');
    }

    // Initialize
    renderTransactions();
    renderProducts();
    renderWorkers();
    renderLogs();
  </script>
</body>
</html>`;

  rootFolder.file('index.html', offlineAppHtml);

  return await zip.generateAsync({ type: 'blob' });
}
