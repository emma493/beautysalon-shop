import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Copy, Check, Database, ExternalLink } from 'lucide-react';

const SUPABASE_SQL_CODE = `-- ====================================================================
-- GROCERY MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- Copy and paste this script into your Supabase SQL Editor (https://supabase.com)
-- ====================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(50) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  other_names VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  phone_number VARCHAR(30),
  ghana_card_id VARCHAR(50),
  location VARCHAR(150),
  date_of_employment DATE,
  notes TEXT,
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'worker',
  password VARCHAR(255) NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS store_locations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  variant VARCHAR(100),
  description TEXT,
  supplier_info TEXT,
  expiration_date DATE,
  category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
  location_id VARCHAR(50) REFERENCES store_locations(id) ON DELETE SET NULL,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  quantity_in_stock INT NOT NULL DEFAULT 0,
  initial_quantity INT NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  customer_name VARCHAR(150),
  customer_phone VARCHAR(30),
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  order_date VARCHAR(20) NOT NULL,
  order_time VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  worker_id VARCHAR(50) REFERENCES profiles(id) ON DELETE SET NULL,
  worker_name VARCHAR(150),
  pdf_file_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(150) NOT NULL,
  variant VARCHAR(100),
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  target_user_ids TEXT[],
  scheduled_for TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS notes (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback_messages (
  id VARCHAR(50) PRIMARY KEY,
  worker_id VARCHAR(50) REFERENCES profiles(id) ON DELETE CASCADE,
  worker_name VARCHAR(150),
  sender_role VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type VARCHAR(20),
  read_by_admin BOOLEAN DEFAULT FALSE,
  read_by_worker BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  user_name VARCHAR(150),
  role VARCHAR(20),
  action VARCHAR(50),
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS system_settings (
  id INT PRIMARY KEY DEFAULT 1,
  shop_name VARCHAR(150) DEFAULT 'Beauty Salon',
  company_logo_url TEXT,
  phone VARCHAR(50) DEFAULT '054 285 9612',
  email VARCHAR(100) DEFAULT 'info@grocery.com',
  address VARCHAR(200) DEFAULT 'Accra, Ghana',
  currency VARCHAR(10) DEFAULT 'GH₵',
  currency_code VARCHAR(10) DEFAULT 'GHS',
  admin_email VARCHAR(100) DEFAULT 'admin@grocery.com'
);

-- INITIAL ADMIN ACCOUNT
INSERT INTO profiles (id, first_name, last_name, other_names, email, phone_number, ghana_card_id, location, date_of_employment, notes, avatar_url, role, password)
VALUES ('ADMIN001', 'System', 'Admin', 'Manager', 'admin@grocery.com', '0542859612', 'GHA-000000000-1', 'Head Office', '2026-01-01', 'Primary Admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'admin', 'AdminPassword123')
ON CONFLICT (id) DO NOTHING;

INSERT INTO system_settings (id, shop_name, phone, email, address, currency, currency_code)
VALUES (1, 'Beauty Salon', '054 285 9612', 'info@beautysalon.com', 'Accra, Ghana', 'GH₵', 'GHS')
ON CONFLICT (id) DO NOTHING;
`;

interface SupabaseModalProps {
  onClose?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ onClose }) => {
  const { isSqlModalOpen, setIsSqlModalOpen, showToast } = useStore();
  const [copied, setCopied] = useState(false);

  if (!isSqlModalOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_CODE);
    setCopied(true);
    showToast('Supabase SQL schema copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-orange-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-600 text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Supabase SQL Schema Script</h2>
              <p className="text-xs text-slate-5-00 dark:text-slate-400">Copy & paste into your Supabase SQL Editor to initialize online database tables</p>
            </div>
          </div>
          <button
            onClick={() => setIsSqlModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <span>
            <strong>Steps:</strong> 1. Open <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-semibold inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a> → 2. Go to SQL Editor → 3. Paste code & click <strong>RUN</strong>.
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs shadow-xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied SQL!' : 'Copy SQL Script'}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto font-mono text-xs bg-slate-950 text-slate-200 leading-relaxed rounded-b-2xl">
          <pre>{SUPABASE_SQL_CODE}</pre>
        </div>
      </div>
    </div>
  );
};
