import fs from 'fs';
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
    console.log('📡 Connected. Creating emergency recovery script...');

    // Commands to clean and reinstall
    const cmd = `
        cd ${process.env.REMOTE_PATH} &&
        rm -rf node_modules package-lock.json &&
        npm install --production &&
        pm2 reload ecosystem.config.cjs
    `;

    console.log('⚡ Executing Emergency Reinstall & Reload...');

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log(`✅ Recovery command closed with code ${code}`);
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect(config);
