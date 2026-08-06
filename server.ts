import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY =
  process.env.PAYSTACK_PUBLIC_KEY || '';
const PAYSTACK_PLAN_CODE =
  process.env.PAYSTACK_PLAN_CODE || 'PLN_qnn0395op4uzo4d';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Config endpoint
  app.get('/api/paystack/config', (_req, res) => {
    res.json({
      publicKey: PAYSTACK_PUBLIC_KEY,
      planCode: PAYSTACK_PLAN_CODE,
      amountGhs: 200,
    });
  });

  // Initialize Transaction endpoint
  app.post('/api/paystack/initialize', async (req, res) => {
    try {
      const { email, phone, amount } = req.body;
      const chargeAmount = (amount || 200) * 100; // in pesewas

      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || `momo_${phone || 'guest'}@mtnmomo.gh`,
          amount: chargeAmount,
          currency: 'GHS',
          plan: PAYSTACK_PLAN_CODE,
          channels: ['mobile_money'],
          metadata: {
            mobile_number: phone,
            provider: 'MTN Mobile Money',
            custom_fields: [
              {
                display_name: 'Mobile Number',
                variable_name: 'mobile_number',
                value: phone,
              },
            ],
          },
        }),
      });

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Paystack Initialize Error:', error);
      res.status(500).json({ status: false, message: error.message || 'Failed to initialize Paystack transaction' });
    }
  });

  // Direct Mobile Money Charge Endpoint
  app.post('/api/paystack/charge', async (req, res) => {
    try {
      const { phone, email, amount } = req.body;
      const cleanPhone = (phone || '').replace(/\s+/g, '');
      const chargeAmount = (amount || 200) * 100;

      const response = await fetch('https://api.paystack.co/charge', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || `momo_${cleanPhone}@mtnmomo.gh`,
          amount: chargeAmount.toString(),
          currency: 'GHS',
          plan: PAYSTACK_PLAN_CODE,
          mobile_money: {
            phone: cleanPhone,
            provider: 'mtn',
          },
        }),
      });

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Paystack Charge Error:', error);
      res.status(500).json({ status: false, message: error.message || 'Failed to trigger MoMo charge' });
    }
  });

  // Verify Transaction Endpoint
  app.get('/api/paystack/verify/:reference', async (req, res) => {
    try {
      const { reference } = req.params;
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Paystack Verify Error:', error);
      res.status(500).json({ status: false, message: error.message || 'Failed to verify Paystack transaction' });
    }
  });

  // Fetch Live Paystack Transactions Endpoint
  app.get('/api/paystack/transactions', async (_req, res) => {
    try {
      const response = await fetch('https://api.paystack.co/transaction?perPage=50', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Paystack Transactions List Error:', error);
      res.status(500).json({ status: false, message: error.message || 'Failed to fetch Paystack transactions' });
    }
  });

  // Serve static assets or mount Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
