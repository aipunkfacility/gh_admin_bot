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
    console.log('📡 Connected. Starting remote build and reload...');

    const cmd = `cd ${process.env.REMOTE_PATH} && git fetch origin && git reset --hard origin/main && npm run build && pm2 reload greenhill`;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log(`\n✅ Remote process finished with code ${code}`);
            conn.end();
            process.exit(code);
        }).on('data', (data) => {
            process.stdout.write(data);
        }).stderr.on('data', (data) => {
            process.stderr.write(data);
        });
    });
}).on('error', (err) => {
    console.error('❌ SSH Connection Error:', err.message);
    process.exit(1);
}).connect(config);
