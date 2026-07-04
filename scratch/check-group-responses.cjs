const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

console.log('GET /api/v1/groups/{groupId} responses:');
console.log(JSON.stringify(swagger.paths['/api/v1/groups/{groupId}']?.get?.responses, null, 2));

console.log('\nGET /api/v1/groups/one/{id} responses:');
console.log(JSON.stringify(swagger.paths['/api/v1/groups/one/{id}']?.get?.responses, null, 2));
