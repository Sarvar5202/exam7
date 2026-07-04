const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
console.log('UpdatePasswordDto:', JSON.stringify(swagger.components?.schemas?.UpdatePasswordDto, null, 2));
