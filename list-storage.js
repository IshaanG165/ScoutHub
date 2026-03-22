const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const lines = envLocal.split('\n');
let url = '', key = '';
lines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function checkStorage() {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (buckets) {
       for (let b of buckets) {
          console.log("Bucket:", b.name);
          const { data: files } = await supabase.storage.from(b.name).list();
          if (files) console.log("Files:", files.map(f => f.name));
       }
    }
}
checkStorage();
