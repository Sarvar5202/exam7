const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
console.log('AttendanceItemDto:', JSON.stringify(swagger.components?.schemas?.AttendanceItemDto, null, 2));
