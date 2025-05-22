import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var ${name}`);
    process.exit(1);
  }
  return v;
}

export const DEVICE_IP      = getEnv('DEVICE_IP');
export const DEVICE_PORT    = Number(getEnv('DEVICE_PORT'));
export const BFF_ENDPOINT   = getEnv('BFF_ENDPOINT');
export const SEND_TIMEOUT   = Number(getEnv('SEND_TIMEOUT'));
export const RECEIVE_TIMEOUT= Number(getEnv('RECEIVE_TIMEOUT'));
