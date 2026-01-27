
const https = require('https');
const fs = require('fs');
const path = require('path');

// 1. Load .env
const envPath = path.join(process.cwd(), '.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key.trim()] = val.join('=').trim();
    return acc;
}, {});

const url = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.error('❌ Missing URL or KEY in .env');
    process.exit(1);
}

// Prepare URL for REST API
// https://[project].supabase.co -> https://[project].supabase.co/rest/v1/transport_items?limit=1
const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
const finalUrl = `${baseUrl}/rest/v1/transport_items?select=*&limit=1`;

console.log(`[REST-Diag] Target: ${finalUrl}`);

const options = {
    headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
    }
};

https.get(finalUrl, options, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const data = JSON.parse(rawData);
            if (res.statusCode !== 200) {
                console.error(`❌ API Error (${res.statusCode}):`, data);
                return;
            }

            console.log('✅ Connection SUCCESS!');
            if (data.length > 0) {
                const item = data[0];
                console.log('\n👉 FOUND COLUMNS IN DB:');
                console.log(JSON.stringify(Object.keys(item), null, 2));
            } else {
                console.log('⚠️ No items found in table.');
            }
        } catch (e) {
            console.error('❌ Error parsing response:', e.message);
            console.log('Raw response:', rawData);
        }
    });
}).on('error', (e) => {
    console.error(`❌ Request failed: ${e.message}`);
});
