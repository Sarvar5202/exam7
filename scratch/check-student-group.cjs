const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
console.log('CreateStudentGroupDto:', JSON.stringify(swagger.components?.schemas?.CreateStudentGroupDto, null, 2));
console.log('/api/v1/student-group POST:', JSON.stringify(swagger.paths['/api/v1/student-group']?.post, null, 2));
