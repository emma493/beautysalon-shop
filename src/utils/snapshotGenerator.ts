import JSZip from 'jszip';
import { Order, Product, UserProfile, LogEntry, SystemSettings } from '../types';

/**
 * Generates a complete standalone offline HTML Application file containing
 * all company data with built-in offline search, filter, date range picker,
 * product catalog, staff directory, and printable receipt viewers.
 */
export function generateOfflineHTMLSnapshot(
  year: number,
  orders: Order[],
  products: Product[],
  users: UserProfile[],
  logs: LogEntry[],
  settings: SystemSettings
): string {
  const shopName = settings.shopName || 'Socialfunera Management System';
  const currency = settings.currency || 'GH₵';
  const logoUrl = settings.companyLogoUrl || '';

  const snapshotData = {
    exportedAt: new Date().toISOString(),
    fiscalYear: year,
    company: {
      name: shopName,
      logoUrl: logoUrl,
      currency: currency,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
    },
    metrics: {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      totalProducts: products.length,
      totalWorkers: users.length,
    },
    orders,
    products,
    users,
    logs,
  };

  const jsonStr = JSON.stringify(snapshotData);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline Snapshot ${year} - ${shopName}</title>
  <style>
    :root {
      --bg-dark: #0f172a;
      --card-dark: #1e293b;
      --border-dark: #334155;
      --accent: #10b981;
      --accent-hover: #059669;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: var(--bg-dark); color: var(--text-main); padding: 20px; line-height: 1.5; }
    .container { max-width: 1200px; margin: 0 auto; }
    header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 20px; border-bottom: 1px solid var(--border-dark); margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .brand { display: flex; items-center; gap: 12px; }
    .brand img { width: 44px; height: 44px; border-radius: 12px; object-fit: cover; }
    .brand h1 { font-size: 20px; font-weight: 800; color: #fff; }
    .brand p { font-size: 12px; color: var(--text-muted); }
    .badge { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
    
    .grid-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card-metric { background: var(--card-dark); border: 1px solid var(--border-dark); padding: 20px; border-radius: 16px; }
    .card-metric .label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
    .card-metric .value { font-size: 24px; font-weight: 900; color: #fff; margin-top: 4px; }
    
    .tabs { display: flex; gap: 8px; border-bottom: 1px solid var(--border-dark); margin-bottom: 20px; overflow-x: auto; }
    .tab-btn { background: none; border: none; color: var(--text-muted); padding: 10px 18px; font-size: 13px; font-weight: 700; cursor: pointer; border-bottom: 2px solid transparent; }
    .tab-btn.active { color: #34d399; border-bottom-color: #34d399; }
    
    .controls { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .input-search, .input-date { background: #090d16; border: 1px solid var(--border-dark); color: #fff; padding: 10px 14px; border-radius: 10px; font-size: 13px; outline: none; }
    .input-search { flex: 1; min-w: 200px; }
    
    table { width: 100%; border-collapse: collapse; background: var(--card-dark); border-radius: 16px; overflow: hidden; border: 1px solid var(--border-dark); }
    th { background: rgba(15, 23, 42, 0.6); text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); border-bottom: 1px solid var(--border-dark); }
    td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid rgba(51, 65, 85, 0.5); }
    tr:hover { background: rgba(51, 65, 85, 0.3); }
    
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .product-card { background: var(--card-dark); border: 1px solid var(--border-dark); border-radius: 16px; padding: 16px; }
    .product-card img { width: 100%; height: 140px; object-fit: cover; border-radius: 12px; margin-bottom: 12px; }
    .product-card h4 { font-size: 15px; font-weight: 700; color: #fff; }
    .product-card p { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .product-card .price { font-size: 16px; font-weight: 800; color: #34d399; margin-top: 8px; }

    .print-btn { background: #10b981; color: #fff; border: none; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; }
    .print-btn:hover { background: #059669; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo">` : '<div style="width:44px;height:44px;background:#10b981;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;">SF</div>'}
        <div>
          <h1>${shopName}</h1>
          <p>Fiscal Year ${year} Complete Offline Data Snapshot</p>
        </div>
      </div>
      <div class="badge">OFFLINE SNAPSHOT VERIFIED</div>
    </header>

    <div class="grid-metrics">
      <div class="card-metric">
        <div class="label">Total Orders (${year})</div>
        <div class="value" id="metric-orders">${orders.length}</div>
      </div>
      <div class="card-metric">
        <div class="label">Total Revenue (${year})</div>
        <div class="value" id="metric-revenue">${currency} ${orders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
      </div>
      <div class="card-metric">
        <div class="label">Inventory Items</div>
        <div class="value">${products.length}</div>
      </div>
      <div class="card-metric">
        <div class="label">Active Workers</div>
        <div class="value">${users.length}</div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('orders')">Transactions (${orders.length})</button>
      <button class="tab-btn" onclick="switchTab('products')">Inventory Catalog (${products.length})</button>
      <button class="tab-btn" onclick="switchTab('workers')">Staff Directory (${users.length})</button>
      <button class="tab-btn" onclick="switchTab('logs')">Audit Logs (${logs.length})</button>
    </div>

    <div class="controls">
      <input type="text" id="search-input" class="input-search" placeholder="Search snapshot records..." oninput="renderCurrentView()">
      <input type="date" id="date-from" class="input-date" onchange="renderCurrentView()">
      <input type="date" id="date-to" class="input-date" onchange="renderCurrentView()">
      <button class="print-btn" onclick="resetFilters()">Clear Filters</button>
    </div>

    <div id="view-container"></div>
  </div>

  <script id="snapshot-data" type="application/json">
    ${jsonStr.replace(/</g, '\\u003c')}
  </script>

  <script>
    const rawData = JSON.parse(document.getElementById('snapshot-data').textContent);
    let currentTab = 'orders';

    function switchTab(tab) {
      currentTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      renderCurrentView();
    }

    function resetFilters() {
      document.getElementById('search-input').value = '';
      document.getElementById('date-from').value = '';
      document.getElementById('date-to').value = '';
      renderCurrentView();
    }

    function renderCurrentView() {
      const container = document.getElementById('view-container');
      const search = document.getElementById('search-input').value.toLowerCase();
      const dateFrom = document.getElementById('date-from').value;
      const dateTo = document.getElementById('date-to').value;

      if (currentTab === 'orders') {
        const filtered = rawData.orders.filter(o => {
          const matchSearch = !search || o.id.toLowerCase().includes(search) || (o.customerName && o.customerName.toLowerCase().includes(search)) || (o.workerName && o.workerName.toLowerCase().includes(search));
          const oDate = o.date || (o.createdAt ? o.createdAt.split('T')[0] : '');
          const matchFrom = !dateFrom || oDate >= dateFrom;
          const matchTo = !dateTo || oDate <= dateTo;
          return matchSearch && matchFrom && matchTo;
        });

        if (filtered.length === 0) {
          container.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8;">No matching transactions found in offline snapshot.</div>';
          return;
        }

        let html = '<table><thead><tr><th>Order ID</th><th>Customer</th><th>Worker</th><th>Date</th><th>Amount</th><th>Receipt</th></tr></thead><tbody>';
        filtered.forEach(o => {
          html += \`<tr>
            <td><strong>#\${o.id}</strong></td>
            <td>\${o.customerName || 'Walk-in'} (\${o.customerPhone || 'N/A'})</td>
            <td>\${o.workerName || 'Staff'}</td>
            <td>\${o.date} \${o.time || ''}</td>
            <td style="color:#34d399;font-weight:bold;">\${rawData.company.currency} \${o.totalAmount.toFixed(2)}</td>
            <td><button class="print-btn" onclick="alert('Order Items:\\n' + JSON.stringify(\${JSON.stringify(o.items)}, null, 2))">View Items</button></td>
          </tr>\`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
      } else if (currentTab === 'products') {
        const filtered = rawData.products.filter(p => !search || p.name.toLowerCase().includes(search) || p.categoryName.toLowerCase().includes(search));
        let html = '<div class="product-grid">';
        filtered.forEach(p => {
          html += \`<div class="product-card">
            \${p.imageUrl ? \`<img src="\${p.imageUrl}" alt="\${p.name}">\` : ''}
            <h4>\${p.name}</h4>
            <p>Category: \${p.categoryName || 'General'} • Stock: \${p.quantityInStock}</p>
            <div class="price">\${rawData.company.currency} \${p.sellingPrice.toFixed(2)}</div>
          </div>\`;
        });
        html += '</div>';
        container.innerHTML = html;
      } else if (currentTab === 'workers') {
        let html = '<table><thead><tr><th>Staff ID</th><th>Name</th><th>Role</th><th>Email</th><th>Phone</th></tr></thead><tbody>';
        rawData.users.forEach(u => {
          html += \`<tr>
            <td><strong>\${u.id}</strong></td>
            <td>\${u.firstName} \${u.lastName}</td>
            <td>\${u.role}</td>
            <td>\${u.email}</td>
            <td>\${u.phoneNumber || 'N/A'}</td>
          </tr>\`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
      } else if (currentTab === 'logs') {
        let html = '<table><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th></tr></thead><tbody>';
        rawData.logs.forEach(l => {
          html += \`<tr>
            <td>\${l.timestamp ? new Date(l.timestamp).toLocaleString() : l.date}</td>
            <td>\${l.userName} (\${l.role})</td>
            <td><strong>\${l.action}</strong></td>
            <td>\${l.details}</td>
          </tr>\`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
      }
    }

    renderCurrentView();
  </script>
</body>
</html>`;
}

export async function generateSnapshotZip(
  targetDate: string,
  orders: Order[],
  products: Product[],
  users: UserProfile[],
  logs: LogEntry[],
  settings: SystemSettings
): Promise<Blob> {
  const zip = new JSZip();

  const year = new Date().getFullYear();
  const htmlContent = generateOfflineHTMLSnapshot(year, orders, products, users, logs, settings);

  const folderName = `Snapshot_${targetDate}`;
  const rootFolder = zip.folder(folderName) || zip;

  // Add Standalone HTML Application
  rootFolder.file(`Offline_Snapshot_App_${year}.html`, htmlContent);

  // Add JSON files
  rootFolder.file(
    'metadata.json',
    JSON.stringify(
      {
        snapshotDate: targetDate,
        exportedAt: new Date().toISOString(),
        shopName: settings.shopName,
        totalOrdersCount: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      },
      null,
      2
    )
  );

  rootFolder.file('orders.json', JSON.stringify(orders, null, 2));
  rootFolder.file('inventory_products.json', JSON.stringify(products, null, 2));
  rootFolder.file(
    'active_workers.json',
    JSON.stringify(
      users.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        email: u.email,
        location: u.location,
        dateOfEmployment: u.dateOfEmployment,
      })),
      null,
      2
    )
  );
  rootFolder.file('activity_logs.json', JSON.stringify(logs, null, 2));

  rootFolder.file(
    'README.txt',
    `SOCIALFUNERA MANAGEMENT SYSTEM - COMPLETE OFFLINE SNAPSHOT
======================================================
Company: ${settings.shopName}
Snapshot Target: ${targetDate}
Exported: ${new Date().toLocaleString()}

INSTRUCTIONS:
1. Double click "Offline_Snapshot_App_${year}.html" to launch your standalone offline company portal in any web browser!
2. You can search, filter by date ranges, inspect all orders, products, and staff offline without internet connection.
`
  );

  return await zip.generateAsync({ type: 'blob' });
}
