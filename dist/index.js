"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const Zkteco = require('zkteco-js');
const config_1 = require("./config");
async function main() {
    // 1) Connect to the biometric device via TCP/WebSocket
    const device = new Zkteco(config_1.DEVICE_IP, config_1.DEVICE_PORT, config_1.SEND_TIMEOUT, config_1.RECEIVE_TIMEOUT);
    await device.createSocket();
    console.log(`🔌 Connected to device at ${config_1.DEVICE_IP}:${config_1.DEVICE_PORT}`);
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // 2) Expose a simple pull endpoint to fetch & forward logs
    app.get('/pull', async (_, res) => {
        try {
            // fetch raw attendance entries from the device
            const raw = await device.getAttendances();
            const entries = Array.isArray(raw)
                ? raw
                : Array.isArray(raw.data)
                    ? raw.data
                    : Object.values(raw);
            // normalize each entry
            const normalized = entries.map(e => {
                const t = new Date(e.recordTime || e.record_time);
                return {
                    id: `${config_1.INGESTION_ID}-${e.sn}`,
                    deviceId: config_1.INGESTION_ID,
                    userId: e.user_id,
                    timestamp: t.toISOString(),
                    type: e.type,
                    state: e.state,
                    ip: e.ip
                };
            });
            // 3) Push to the BFF ingest endpoint
            await axios_1.default.post(config_1.BFF_ENDPOINT, { entries: normalized });
            console.log(`📤 Pushed ${normalized.length} records to ${config_1.BFF_ENDPOINT}`);
            res.status(200).json({ pushed: normalized.length });
        }
        catch (err) {
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
        }
        catch { /* ignore */ }
        process.exit(0);
    });
}
main().catch(err => {
    console.error('Fatal error starting ingestion service:', err);
    process.exit(1);
});
