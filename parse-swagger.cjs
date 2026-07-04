const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

const filesPaths = Object.keys(swagger.paths).filter(p => p.includes('file'));
console.log('Files Paths:', filesPaths);
for (const p of filesPaths) {
  console.log(p, JSON.stringify(swagger.paths[p].get, null, 2));
}
