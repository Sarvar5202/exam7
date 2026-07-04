const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
console.log(JSON.stringify(swagger.paths['/api/v1/auth/login'], null, 2));
