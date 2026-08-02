import JSZip from 'jszip';
import { Order, Product, UserProfile, LogEntry, SystemSettings } from '../types';

export async function generateSnapshotZip(
  targetDate: string, // YYYY-MM-DD or DD-MM-YYYY
  orders: Order[],
  products: Product[],
  users: UserProfile[],
  logs: LogEntry[],
  settings: SystemSettings
): Promise<Blob> {
  const zip = new JSZip();

  // Filter items for target date or overview
  const dateOrders = orders.filter((o) => o.date === targetDate || o.createdAt.startsWith(targetDate));
  const dateLogs = logs.filter((l) => l.date === targetDate || l.timestamp.startsWith(targetDate));

  const folderName = `Snapshot_${targetDate}`;
  const rootFolder = zip.folder(folderName) || zip;

  // Add JSON files
  rootFolder.file('metadata.json', JSON.stringify({
    snapshotDate: targetDate,
    exportedAt: new Date().toISOString(),
    shopName: settings.shopName,
    totalOrdersCount: dateOrders.length,
    totalRevenue: dateOrders.reduce((sum, o) => sum + o.totalAmount, 0),
  }, null, 2));

  rootFolder.file('orders.json', JSON.stringify(dateOrders, null, 2));
  rootFolder.file('inventory_products.json', JSON.stringify(products, null, 2));
  rootFolder.file('active_workers.json', JSON.stringify(users.map(u => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    email: u.email,
    location: u.location,
    dateOfEmployment: u.dateOfEmployment,
  })), null, 2));
  rootFolder.file('activity_logs.json', JSON.stringify(dateLogs, null, 2));

  // Add Readme text
  rootFolder.file('README.txt', `GROCERY MANAGEMENT SYSTEM - OFFLINE SNAPSHOT
=====================================================
Snapshot Date: ${targetDate}
Company: ${settings.shopName}
Total Orders on Date: ${dateOrders.length}
Generated: ${new Date().toLocaleString()}

CONTENTS:
- metadata.json: High level summary of sales and snapshot info
- orders.json: All transactions and receipt data for ${targetDate}
- inventory_products.json: Inventory status as of this snapshot
- active_workers.json: List of staff accounts
- activity_logs.json: Detailed system logs for ${targetDate}
`);

  return await zip.generateAsync({ type: 'blob' });
}
