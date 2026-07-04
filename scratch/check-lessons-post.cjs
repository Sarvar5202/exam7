const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
console.log('POST /api/v1/lessons:', JSON.stringify(swagger.paths['/api/v1/lessons']?.post, null, 2));
if (swagger.paths['/api/v1/lessons']?.post?.requestBody?.content?.['application/json']?.schema?.$ref) {
  const ref = swagger.paths['/api/v1/lessons'].post.requestBody.content['application/json'].schema.$ref.split('/').pop();
  console.log(`${ref}:`, JSON.stringify(swagger.components.schemas[ref], null, 2));
}
