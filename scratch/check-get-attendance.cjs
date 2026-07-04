const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
console.log('GET /api/v1/attendance/all:', JSON.stringify(swagger.paths['/api/v1/attendance/all']?.get, null, 2));
