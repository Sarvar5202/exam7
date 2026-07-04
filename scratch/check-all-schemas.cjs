const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

console.log('Schemas:');
const schemas = swagger.components?.schemas || swagger.definitions || {};
for (const name in schemas) {
  console.log(`- ${name}`);
  const schema = schemas[name];
  if (schema.properties) {
    for (const prop in schema.properties) {
      const p = schema.properties[prop];
      if (p.example) {
        console.log(`  ${prop}: example = ${JSON.stringify(p.example)}`);
      }
    }
  }
}
