const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
console.log('GET /api/v1/groups/{groupId}/lesson:', JSON.stringify(swagger.paths['/api/v1/groups/{groupId}/lesson']?.get, null, 2));
