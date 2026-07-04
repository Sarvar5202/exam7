const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
console.log('CreateAttendanceDto:', JSON.stringify(swagger.components?.schemas?.CreateAttendanceDto, null, 2));
console.log('/api/v1/attendance POST:', JSON.stringify(swagger.paths['/api/v1/attendance']?.post, null, 2));
