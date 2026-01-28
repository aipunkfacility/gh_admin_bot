import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = {
    host: process.env.SSH_HOST,
    username: process.env.SSH_USER,
    password: process.env.SSH_PASS,
};

async function fetchLogs() {
    const conn = new Client();

    conn.on('ready', () => {
        console.log('📡 Connected to server. Fetching logs...');

        conn.exec('pm2 logs greenhill --lines 50 --nostream', (err, stream) => {
            if (err) throw err;

            stream.on('close', (code, signal) => {
                console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                conn.end();
            }).on('data', (data) => {
                console.log(data.toString());
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    }).connect(config);
}

fetchLogs();
