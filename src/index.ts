import express from 'express';
import axios from 'axios';
const Zkteco    = require('zkteco-js');
import {
  DEVICE_IP,
  DEVICE_PORT,
  BFF_ENDPOINT,
  SEND_TIMEOUT,
  RECEIVE_TIMEOUT
} from './config';
import { RawEntry, NormalizedEntry } from './types';

async function main() {
  // 1) Connect to the biometric device via TCP/WebSocket
  const device = new Zkteco(
    DEVICE_IP,
    DEVICE_PORT,
    SEND_TIMEOUT,
    RECEIVE_TIMEOUT
  );
  await device.createSocket();
  console.log(`🔌 Connected to device at ${DEVICE_IP}:${DEVICE_PORT}`);

  const app = express();
  app.use(express.json());

  // 2) Expose a simple pull endpoint to fetch & forward logs
  app.get('/pull', async (_, res) => {
    try {
      // fetch raw attendance entries from the device
      const raw: RawEntry[] | any = await device.getAttendances();
      const entries: RawEntry[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.data)
          ? raw.data
          : Object.values(raw);

      // normalize each entry
      const normalized: NormalizedEntry[] = entries.map(e => {
        const t = new Date(e.recordTime || e.record_time!);
        return {
          id: e.sn.toString(),
          userId: e.user_id,
          timestamp: t.toISOString(),
          type: e.type,
          state: e.state,
          ip: e.ip
        };
      });

      // 3) Push to the BFF ingest endpoint
      await axios.post(BFF_ENDPOINT, { entries: normalized });
      console.log(`📤 Pushed ${normalized.length} records to ${BFF_ENDPOINT}`);
      res.status(200).json({ pushed: normalized.length });
    } catch (err: any) {
      console.error('❌ Ingestion error', err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Ingestion service listening on http://localhost:${PORT}`);
  });

  // Gracefully handle shutdown
  process.on('SIGINT', async () => {
    console.log('🛑 Shutting down ingestion service...');
    try {
      await device.disconnect();
    } catch { /* ignore */ }
    process.exit(0);
  });
}

main().catch(err => {
  console.error('Fatal error starting ingestion service:', err);
  process.exit(1);
});
