import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const conn = new Client();

const config = {
    host: process.env.SSH_HOST,
    port: 22,
    username: process.env.SSH_USER,
    password: process.env.SSH_PASS,
};

conn.on('ready', () => {
    console.log('📡 Connected. Verifying site accessibility...');

    // Check main page and admin excursions
    const cmd = `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/ && echo " " && curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/admin/excursions`;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            process.stdout.write('HTTP Status Codes (Root & Admin): ' + data.toString());
        });
    });
}).connect(config);
