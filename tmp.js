const fs = require('fs');
let content = fs.readFileSync('supabase/schema.sql', 'utf8');

// First, strip out any existing drop policy statements if they exist right before create policy
content = content.replace(/drop policy if exists "[^"]+" on [^\s]+;\s*(?=create policy)/gi, '');

// Then automatically inject drop policy before every create policy
content = content.replace(/create policy "([^"]+)" on ([^\s]+)\s+for/gi, (match, name, table) => {
    return 'drop policy if exists "' + name + '" on ' + table + ';\n' + match;
});

fs.writeFileSync('supabase/schema.sql', content);
