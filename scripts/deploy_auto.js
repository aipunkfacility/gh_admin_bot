
import { Client } from 'ssh2';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = {
    host: process.env.SSH_HOST || '85.198.68.12',
    port: 22,
    username: process.env.SSH_USER || 'root',
    password: process.env.SSH_PASS,
    remotePath: process.env.REMOTE_PATH || '/var/www/greenhill'
};

if (!config.password) {
    console.error('❌ Error: SSH_PASS is not set in .env');
    process.exit(1);
}

const conn = new Client();

console.log('🚀 Starting Automated Deployment...');
console.log(`📡 Connecting to ${config.username}@${config.host}...`);

conn.on('ready', () => {
    console.log('✅ SSH Connection established.');

    conn.sftp((err, sftp) => {
        if (err) throw err;

        console.log('📂 Starting File Uploads...');

        const uploadFile = (local, remote) => {
            return new Promise((resolve, reject) => {
                const localPath = path.join(__dirname, '..', local);
                const remoteFilePath = `${config.remotePath}/${remote}`;

                console.log(`   ⬆️  Uploading ${local} -> ${remoteFilePath}`);

                sftp.fastPut(localPath, remoteFilePath, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        };

        // Upload List
        Promise.all([
            uploadFile('.env', '.env'),
            uploadFile('ecosystem.config.cjs', 'ecosystem.config.cjs')
        ])
            .then(() => {
                console.log('✨ All configuration files uploaded.');

                // Execute Commands
                console.log('⚙️  Executing Remote Commands...');
                const commands = [
                    `cd ${config.remotePath}`,
                    'echo "🔄 Git Fetch & Reset..."',
                    'git fetch origin',
                    'git reset --hard origin/main',
                    'echo "📦 Installing Dependencies..."',
                    'npm ci',
                    'echo "🏗️  Building Project..."',
                    'npm run build',
                    'echo "🔄 Reloading PM2..."',
                    'pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs',
                    'pm2 save',
                    'echo "✅ DEPLOYMENT COMPLETE"'
                ].join(' && ');

                conn.exec(commands, (err, stream) => {
                    if (err) throw err;

                    stream.on('close', (code, signal) => {
                        console.log(`\nPROCESS CLOSED :: code=${code}, signal=${signal}`);
                        conn.end();
                        if (code === 0) {
                            console.log('🎉 Deployment Successful!');
                        } else {
                            console.error('❌ Deployment Failed.');
                            process.exit(1);
                        }
                    }).on('data', (data) => {
                        process.stdout.write(data);
                    }).stderr.on('data', (data) => {
                        process.stderr.write(data);
                    });
                });
            })
            .catch(err => {
                console.error('❌ Upload Error:', err);
                conn.end();
                process.exit(1);
            });
    });
}).on('error', (err) => {
    console.error('❌ Connection Error:', err);
    process.exit(1);
}).connect(config);
