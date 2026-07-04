const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
console.log('CreateAdminDto:', JSON.stringify(swagger.components?.schemas?.CreateAdminDto, null, 2));
