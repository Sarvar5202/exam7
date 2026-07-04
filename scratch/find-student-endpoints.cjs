const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

console.log('STUDENT Endpoints in Swagger:');
for (const path in swagger.paths) {
  for (const method in swagger.paths[path]) {
    const route = swagger.paths[path][method];
    const desc = route.description || '';
    const summary = route.summary || '';
    const tags = route.tags || [];
    
    // Check if description/summary/tags contains STUDENT
    if (
      desc.toUpperCase().includes('STUDENT') ||
      summary.toUpperCase().includes('STUDENT') ||
      tags.some(t => t.toUpperCase().includes('STUDENT')) ||
      path.includes('/student')
    ) {
      console.log(`\n- ${method.toUpperCase()} ${path}`);
      console.log(`  Description: ${desc}`);
      console.log(`  Summary: ${summary}`);
      console.log(`  Tags: ${JSON.stringify(tags)}`);
    }
  }
}
