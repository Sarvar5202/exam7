const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

console.log('UpdateGroupDto:', JSON.stringify(swagger.components?.schemas?.UpdateGroupDto, null, 2));
console.log('CreateGroupDto:', JSON.stringify(swagger.components?.schemas?.CreateGroupDto, null, 2));
