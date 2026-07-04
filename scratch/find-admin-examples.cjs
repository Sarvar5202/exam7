const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

console.log('Searching swagger for admin/superadmin references:');
const findInObj = (obj, path = '') => {
  if (!obj) return;
  if (typeof obj === 'string') {
    if (obj.includes('998') || obj.includes('admin') || obj.includes('super')) {
      console.log(`Found string at ${path}: "${obj}"`);
    }
  } else if (typeof obj === 'object') {
    for (const key in obj) {
      findInObj(obj[key], path ? `${path}.${key}` : key);
    }
  }
};

findInObj(swagger);
