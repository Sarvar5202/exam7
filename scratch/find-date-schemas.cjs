const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

console.log('Searching all schemas for date fields:');
const schemas = swagger.components?.schemas || {};
for (const name in schemas) {
  const schema = schemas[name];
  if (schema.properties) {
    for (const prop in schema.properties) {
      if (prop.toLowerCase().includes('date') || prop.toLowerCase().includes('time')) {
        console.log(`- ${name}.${prop}: ${JSON.stringify(schema.properties[prop])}`);
      }
    }
  }
}
