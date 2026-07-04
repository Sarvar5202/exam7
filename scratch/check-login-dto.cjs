const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
console.log(JSON.stringify(swagger.components?.schemas?.LoginDto || swagger.definitions?.LoginDto, null, 2));
