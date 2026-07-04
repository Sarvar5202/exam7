import fs from 'fs';

try {
  const fileContent = fs.readFileSync('scratch/swagger-init.txt', 'utf8');
  // Find "swaggerDoc":
  const startIdx = fileContent.indexOf('"swaggerDoc":');
  if (startIdx === -1) {
    console.error('swaggerDoc not found in file');
    process.exit(1);
  }
  
  // Find the opening brace of swaggerDoc
  const jsonStart = fileContent.indexOf('{', startIdx);
  // Find the end by parsing or matching braces
  let braceCount = 0;
  let jsonEnd = -1;
  for (let i = jsonStart; i < fileContent.length; i++) {
    if (fileContent[i] === '{') braceCount++;
    else if (fileContent[i] === '}') braceCount--;
    
    if (braceCount === 0) {
      jsonEnd = i + 1;
      break;
    }
  }
  
  if (jsonEnd === -1) {
    console.error('Could not find matching closing brace for swaggerDoc');
    process.exit(1);
  }
  
  const jsonStr = fileContent.substring(jsonStart, jsonEnd);
  const swagger = JSON.parse(jsonStr);
  
  console.log(`OpenAPI version: ${swagger.openapi}`);
  console.log('Endpoints:');
  
  const studentPaths = [];
  const otherPaths = [];
  
  Object.keys(swagger.paths).forEach(path => {
    const methods = Object.keys(swagger.paths[path]);
    methods.forEach(method => {
      const details = swagger.paths[path][method];
      const summary = details.summary || '';
      const tags = details.tags || [];
      const opId = details.operationId || '';
      
      const endpointInfo = { path, method, summary, tags, opId };
      
      // If path contains student, students, or summary contains STUDENT, or tags contain Students
      if (
        path.includes('student') || 
        summary.includes('STUDENT') || 
        tags.some(t => t.toLowerCase().includes('student'))
      ) {
        studentPaths.push(endpointInfo);
      } else {
        otherPaths.push(endpointInfo);
      }
    });
  });
  
  console.log('\n--- STUDENT PANEL ENDPOINTS ---');
  studentPaths.forEach(ep => {
    console.log(`${ep.method.toUpperCase()} ${ep.path} (${ep.opId}) - Roles: ${ep.summary} - Tags: ${ep.tags.join(', ')}`);
  });
  
  console.log('\n--- OTHER ENDPOINTS ---');
  otherPaths.forEach(ep => {
    console.log(`${ep.method.toUpperCase()} ${ep.path} (${ep.opId}) - Roles: ${ep.summary} - Tags: ${ep.tags.join(', ')}`);
  });
  
} catch (err) {
  console.error('Error:', err);
}
