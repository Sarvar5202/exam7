const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

console.log('GET /api/v1/groups/{groupId}/lessons:');
console.log(JSON.stringify(swagger.paths['/api/v1/groups/{groupId}/lessons'], null, 2));

console.log('\nGET /api/v1/lessons/my/group/{groupId}:');
console.log(JSON.stringify(swagger.paths['/api/v1/lessons/my/group/{groupId}'], null, 2));
