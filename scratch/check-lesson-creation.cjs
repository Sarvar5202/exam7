const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
console.log('CreateLessonDto:', JSON.stringify(swagger.components?.schemas?.CreateLessonDto, null, 2));
console.log('/api/v1/groups/{groupId}/lesson POST:', JSON.stringify(swagger.paths['/api/v1/groups/{groupId}/lesson']?.post, null, 2));
