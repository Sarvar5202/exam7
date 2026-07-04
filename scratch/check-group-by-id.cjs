const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

console.log('GET /api/v1/groups/{groupId}:');
console.log(JSON.stringify(swagger.paths['/api/v1/groups/{groupId}']?.get, null, 2));
