import jsPDF from 'jspdf';
import { Order, UserProfile, SystemSettings } from '../types';

const DEFAULT_LOGO_URL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPMa5VhqKVOgQMYbb5sZBdxxb4PGZc0kSiLC3iTRgQWA&s=10';

let cachedLogoUrl = '';
let cachedLogoImg: HTMLImageElement | null = null;
let cachedLogoBase64: string | null = null;

function ensureLogoCached(url: string) {
  if (typeof window === 'undefined') return;
  if (cachedLogoUrl === url && (cachedLogoImg || cachedLogoBase64)) return;
  cachedLogoUrl = url;
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    cachedLogoImg = img;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 120;
      canvas.height = img.naturalHeight || 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        cachedLogoBase64 = canvas.toDataURL('image/jpeg', 0.95);
      }
    } catch (e) {
      console.warn('Could not convert logo to base64 for PDF:', e);
    }
  };
  img.src = url;
}

// Preload the default logo right away
ensureLogoCached(DEFAULT_LOGO_URL);

export function generateOrderReceiptPDF(order: Order, settings: SystemSettings, download: boolean = true) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  // Ensure clean ASCII currency so jsPDF Helvetica never renders 'µ' instead of '₵'
  const pdfCurrency = (() => {
    const raw = settings.currency || 'GHS';
    if (raw.includes('₵') || raw.includes('µ') || raw.includes('GH')) {
      return 'GHS';
    }
    return raw.replace(/[^\x20-\x7E]/g, '');
  })();

  const logoUrl = settings.companyLogoUrl || DEFAULT_LOGO_URL;
  ensureLogoCached(logoUrl);
  const shopName = settings.shopName || 'Beauty Salon';

  // 1. Page Background - Clean Modern Pure White
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 148, 210, 'F');

  // Top accent bar - Emerald Green (#10B981 / RGB 16, 185, 129)
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 148, 3, 'F');

  // 2. Top-Left Logo Image & Contact Info
  let logoDrawn = false;
  if (cachedLogoBase64) {
    try {
      doc.addImage(cachedLogoBase64, 'JPEG', 12, 10, 22, 22);
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.roundedRect(12, 10, 22, 22, 3, 3, 'S');
      logoDrawn = true;
    } catch (err) {
      console.warn('Failed to add base64 logo to PDF', err);
    }
  } else if (cachedLogoImg && cachedLogoImg.complete && cachedLogoImg.naturalWidth > 0) {
    try {
      doc.addImage(cachedLogoImg, 'JPEG', 12, 10, 22, 22);
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.roundedRect(12, 10, 22, 22, 3, 3, 'S');
      logoDrawn = true;
    } catch (err) {
      console.warn('Failed to add image element to PDF', err);
    }
  }

  if (!logoDrawn) {
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(12, 10, 22, 22, 5, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('BS', 23, 21, { align: 'center' });
    doc.setFontSize(5.5);
    doc.text('SALON', 23, 27, { align: 'center' });
  }

  // Store Contact Info beside Logo (NO email and NO website as requested)
  doc.setTextColor(17, 24, 39); // Slate-900
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(shopName, 38, 16);

  doc.setTextColor(75, 85, 99); // Slate-600
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${settings.phone || '054 285 9612'}`, 38, 22);
  doc.text(`${settings.address || 'Accra, Ghana'}`, 38, 27);

  // 3. Top-Right Header (RECEIPT Title with Date & Time)
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT', 136, 16, { align: 'right' });

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`#${order.id}`, 136, 22, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`Date: ${order.date}`, 136, 27, { align: 'right' });
  doc.text(`Time: ${order.time || '12:00 PM'}`, 136, 31.5, { align: 'right' });

  // Divider Line
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.4);
  doc.line(12, 36, 136, 36);

  // 4. Billing To Section
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Billing to:', 12, 43);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${order.customerName || 'Walk-in Customer'}`, 12, 49);

  doc.setTextColor(75, 85, 99);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Phone: ${order.customerPhone || 'N/A'}`, 12, 54);

  // 5. Product Table
  let y = 61;

  // Table Header - Deep Slate Emerald Bar (#065F46 / RGB 6, 95, 70)
  doc.setFillColor(6, 95, 70);
  doc.roundedRect(12, y, 124, 8, 2.5, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Product', 16, y + 5.5);
  doc.text('Price', 94, y + 5.5, { align: 'right' });
  doc.text('Qty', 108, y + 5.5, { align: 'right' });
  doc.text('Total', 133, y + 5.5, { align: 'right' });

  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(31, 41, 55);

  order.items.forEach((item) => {
    const itemName = `${item.productName}${item.variant ? ` (${item.variant})` : ''}`;
    // Permanently restrict text width to 52mm max so long product names never collide with price digits
    const rawLines = doc.splitTextToSize(itemName, 52);
    const nameLines = rawLines.slice(0, 2);
    if (rawLines.length > 2 && nameLines.length === 2) {
      nameLines[1] = nameLines[1].replace(/\.?$/, '...');
    }
    const rowAdvance = nameLines.length > 1 ? 11 : 7;

    if (y + rowAdvance > 175) {
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 148, 210, 'F');
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, 148, 3, 'F');
      y = 20;
    }

    doc.text(nameLines, 16, y);
    doc.text(`${pdfCurrency} ${item.unitPrice.toFixed(2)}`, 94, y, { align: 'right' });
    doc.text(`${item.quantity}`, 108, y, { align: 'right' });
    doc.text(`${pdfCurrency} ${item.totalPrice.toFixed(2)}`, 133, y, { align: 'right' });

    y += rowAdvance;
  });

  // Table Bottom Divider
  doc.setDrawColor(229, 231, 235);
  doc.line(12, y, 136, y);
  y += 8;

  // 6. TOTAL Section ONLY (Removed Subtotal, Shipping, Terms & Conditions, Payment Info, and Attendant as requested)
  // High contrast TOTAL Highlight Bar (#FF6321 / RGB 255, 99, 33)
  doc.setFillColor(255, 99, 33);
  doc.roundedRect(68, y, 68, 10, 3.5, 3.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', 75, y + 6.5);
  doc.text(`${pdfCurrency} ${order.totalAmount.toFixed(2)}`, 133, y + 6.5, { align: 'right' });

  if (download) {
    const filename = order.pdfFileName || `${order.id}_${order.customerPhone}_${order.date}_${order.time}.pdf`.replace(/\s+/g, '');
    doc.save(filename);
  }

  return doc;
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  if (typeof window === 'undefined' || !url) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 400;
        canvas.height = img.naturalHeight || 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        } else {
          resolve(null);
        }
      } catch (e) {
        console.warn('Could not convert image to base64 for PDF:', e);
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = url;
  });
}

export async function generateWorkerCardPDF(worker: UserProfile, settings: SystemSettings, download: boolean = true) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const shopName = settings.shopName || 'Beauty Salon';
  const companyLogoUrl = settings.companyLogoUrl || DEFAULT_LOGO_URL;

  // Load both the Company Logo and the Worker Profile Image in parallel
  const [companyLogoBase64, workerAvatarBase64] = await Promise.all([
    cachedLogoBase64 ? Promise.resolve(cachedLogoBase64) : loadImageAsBase64(companyLogoUrl),
    loadImageAsBase64(worker.avatarUrl),
  ]);

  // 1. Page Background - Clean Pure White
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  // 2. Top Accent Banner - #0A1629 Dark Navy
  doc.setFillColor(10, 22, 41);
  doc.rect(0, 0, 210, 4, 'F');

  // 3. Header Section (Company Logo + Shop Details + Official Document Badge)
  let logoDrawn = false;
  if (companyLogoBase64) {
    try {
      doc.addImage(companyLogoBase64, 'JPEG', 16, 12, 22, 22);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.roundedRect(16, 12, 22, 22, 3, 3, 'S');
      logoDrawn = true;
    } catch (err) {
      console.warn('Failed to draw logo on worker card PDF', err);
    }
  }

  if (!logoDrawn) {
    doc.setFillColor(10, 22, 41);
    doc.roundedRect(16, 12, 22, 22, 4, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text((shopName.slice(0, 2) || 'BS').toUpperCase(), 27, 24, { align: 'center' });
  }

  // Shop Details next to Logo
  doc.setTextColor(10, 22, 41);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(shopName, 42, 19);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.phone || '054 285 9612', 42, 25);
  doc.text(settings.address || 'Accra, Ghana', 42, 30);

  // Top-Right Official Document Title & Timestamp
  doc.setTextColor(10, 22, 41);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL CREDENTIAL', 194, 18, { align: 'right' });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE PROFILE CARD', 194, 24, { align: 'right' });

  // Header Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(16, 38, 194, 38);

  // 4. Hero Worker Profile Card Banner
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(16, 44, 178, 44, 4, 4, 'FD');

  // Worker Profile Picture Box (32x32 mm)
  let avatarDrawn = false;
  if (workerAvatarBase64) {
    try {
      doc.addImage(workerAvatarBase64, 'JPEG', 22, 50, 32, 32);
      doc.setDrawColor(10, 22, 41);
      doc.setLineWidth(0.6);
      doc.roundedRect(22, 50, 32, 32, 3, 3, 'S');
      avatarDrawn = true;
    } catch (err) {
      console.warn('Failed to draw worker avatar on PDF', err);
    }
  }

  const initials = ((worker.firstName?.[0] || 'W') + (worker.lastName?.[0] || 'K')).toUpperCase();
  if (!avatarDrawn) {
    doc.setFillColor(10, 22, 41);
    doc.roundedRect(22, 50, 32, 32, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(initials, 38, 69, { align: 'center' });
  }

  // Worker Name & Role Badges beside Profile Picture
  const fullName = [worker.firstName, worker.lastName, worker.otherNames].filter(Boolean).join(' ');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(10, 22, 41);
  doc.text(fullName, 59, 58);

  // Role Pill (#0A1629)
  const roleText = (worker.role || 'WORKER').toUpperCase();
  doc.setFillColor(10, 22, 41);
  doc.roundedRect(59, 63, 32, 7, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(roleText, 75, 67.8, { align: 'center' });

  // Worker ID Pill (Slate style)
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(94, 63, 44, 7, 2, 2, 'FD');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`ID: ${worker.id}`, 116, 67.8, { align: 'center' });

  // Location line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Branch / Base: ${worker.location || settings.address || 'Main Store'}`, 59, 78);

  // Helper for structured label/value boxes
  const renderFieldBox = (label: string, value: string, x: number, yPos: number, maxW: number = 82) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), x, yPos);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    const wrapped = doc.splitTextToSize(value || 'Not provided', maxW);
    doc.text(wrapped, x, yPos + 5.5);
  };

  const formatEmploymentDateTime = (dateVal?: string) => {
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

  // 5. Section 1: Legal Identity & Employment Specification
  doc.setFillColor(10, 22, 41);
  doc.rect(16, 96, 3, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(10, 22, 41);
  doc.text('1. LEGAL IDENTITY & EMPLOYMENT DETAILS', 22, 100);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(16, 104, 194, 104);

  renderFieldBox('Worker System ID', worker.id, 18, 112);
  renderFieldBox('Full Legal Name', fullName, 18, 126);
  renderFieldBox('ID Number', worker.ghanaCardId || 'Not provided', 18, 140);

  renderFieldBox('Designation / Role', roleText, 108, 112);
  renderFieldBox('Date & Time of Employment', formatEmploymentDateTime(worker.dateOfEmployment), 108, 126);

  // 6. Section 2: Contact & Residential Information
  doc.setFillColor(10, 22, 41);
  doc.rect(16, 156, 3, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(10, 22, 41);
  doc.text('2. CONTACT & RESIDENTIAL INFORMATION', 22, 160);

  doc.setDrawColor(226, 232, 240);
  doc.line(16, 164, 194, 164);

  renderFieldBox('Email Address', worker.email || 'Not provided', 18, 172);
  renderFieldBox('Phone Number', worker.phoneNumber || 'Not provided', 18, 186);

  renderFieldBox('Residential Address / Location', worker.location || 'Not provided', 108, 172);
  renderFieldBox('Administrative Remarks', worker.notes || 'No administrative remarks recorded', 108, 186, 82);

  // 7. Section 3: System Portal Credentials (Confidential)
  doc.setFillColor(10, 22, 41);
  doc.rect(16, 204, 3, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(10, 22, 41);
  doc.text('3. SYSTEM PORTAL LOGIN CREDENTIALS', 22, 208);

  doc.setDrawColor(226, 232, 240);
  doc.line(16, 212, 194, 212);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(10, 22, 41);
  doc.setLineWidth(0.6);
  doc.roundedRect(16, 218, 178, 32, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(10, 22, 41);
  doc.text('PORTAL ACCESS CREDENTIALS (CONFIDENTIAL)', 23, 226);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('LOGIN EMAIL ADDRESS:', 23, 234);
  doc.text('ACCESS PASSWORD:', 23, 242);

  doc.setFontSize(10);
  doc.setTextColor(10, 22, 41);
  doc.text(worker.email || 'Not provided', 70, 234);
  doc.setFont('helvetica', 'bold');
  doc.text(worker.password || '********', 70, 242);

  // 8. Section 4: Executive Authorization & Signatures
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(16, 260, 194, 260);

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(16, 276, 76, 276);
  doc.line(134, 276, 194, 276);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Authorized Management Signature', 16, 281);
  doc.text('Employee Verification Signature', 134, 281);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Employee Profile Record • ${shopName} • Confidential Document`, 105, 290, { align: 'center' });

  if (download) {
    doc.save(`WorkerProfile_${worker.id}_${worker.firstName}.pdf`);
  }

  return doc;
}
