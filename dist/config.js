"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RECEIVE_TIMEOUT = exports.SEND_TIMEOUT = exports.BFF_ENDPOINT = exports.DEVICE_PORT = exports.DEVICE_IP = exports.INGESTION_ID = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from project root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
function getEnv(name) {
    const v = process.env[name];
    if (!v) {
        console.error(`Missing required env var ${name}`);
        process.exit(1);
    }
    return v;
}
exports.INGESTION_ID = getEnv('INGESTION_ID');
exports.DEVICE_IP = getEnv('DEVICE_IP');
exports.DEVICE_PORT = Number(getEnv('DEVICE_PORT'));
exports.BFF_ENDPOINT = getEnv('BFF_ENDPOINT');
exports.SEND_TIMEOUT = Number(getEnv('SEND_TIMEOUT'));
exports.RECEIVE_TIMEOUT = Number(getEnv('RECEIVE_TIMEOUT'));
