
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const tables = [
    'posts',
    'transport_items',
    'transport_categories',
    'sections'
];

async function inspectSchema() {
    console.log('🔍 Inspecting schema types...');

    for (const table of tables) {
        console.log(`\nTable: ${table}`);
        // Hacky way to check types: try to insert invalid data and parse message, 
        // OR select null and look at prototype? No.
        // Better: Query information_schema if possible? Not easily via API.
        // Minimal check: Try to select 'slug' and 'id'

        const { data, error } = await supabaseAdmin.from(table).select('id, slug').limit(1);

        if (error) {
            console.log(`❌ Error: ${error.message}`);
            continue;
        }

        console.log(`✅ Columns id/slug exist.`);
        if (data && data.length > 0) {
            console.log('Sample row:', data[0]);
        } else {
            console.log('Table is empty.');
        }
    }

    // Try to insert a test text ID to see if it fails (UUID check)
    console.log('\n🧪 Testing ID type with "test-id"...');
    const { error: insertError } = await supabaseAdmin.from('transport_categories').insert({
        id: 'test-id-text',
        title: 'Test',
        slug: 'test-slug'
    });

    if (insertError && insertError.message.includes('invalid input syntax for type uuid')) {
        console.log('📝 Result: ID is strictly UUID.');
    } else if (insertError) {
        console.log(`❓ Insert error: ${insertError.message}`);
    } else {
        console.log('📝 Result: ID accepts TEXT (or insert succeeded).');
        // Cleanup
        await supabaseAdmin.from('transport_categories').delete().eq('id', 'test-id-text');
    }
}

inspectSchema();
