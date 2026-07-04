const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

console.log('API Version:', swagger.info?.version);
console.log('Paths:');
for (const path in swagger.paths) {
  const methods = Object.keys(swagger.paths[path]);
  console.log(`- ${path} [${methods.join(', ')}]`);
  for (const method of methods) {
    const desc = swagger.paths[path][method].description || swagger.paths[path][method].summary;
    if (desc) {
      console.log(`  Description: ${desc}`);
    }
  }
}
