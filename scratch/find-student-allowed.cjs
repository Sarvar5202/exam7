const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

console.log('Endpoints explicitly allowing STUDENT:');
for (const path in swagger.paths) {
  for (const method in swagger.paths[path]) {
    const route = swagger.paths[path][method];
    const desc = route.description || '';
    const summary = route.summary || '';
    
    // Check if STUDENT is explicitly mentioned as a role
    // Usually it is in summary or description like "STUDENT", "STUDENT,TEACHER", "Bu endpointga admin va..."
    const roles = [desc, summary].join(' ').toUpperCase();
    if (roles.includes('STUDENT')) {
      console.log(`\n- ${method.toUpperCase()} ${path}`);
      console.log(`  Summary: ${summary}`);
      console.log(`  Description: ${desc}`);
    }
  }
}
