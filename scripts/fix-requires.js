// Dynamic requires are not supported in ESM. This removes the require for 'fs' from the ESM build and since 
// from what I can tell this doesn't impact code paths used by this library its safe to do so (:

const file = process.argv[2] || 'dist/AmazonDaxClient.mjs';
const fs = require('fs');
const c = fs.readFileSync(file, 'utf8');
fs.writeFileSync(file, c.replace(/__require\(\"fs\"\)/g, 'null'));