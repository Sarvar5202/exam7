const https = require('https');
const fs = require('fs');

const urls = [
  'https://najot-edu.softwareengineer.uz/api-json',
  'https://najot-edu.softwareengineer.uz/swagger-json',
  'https://najot-edu.softwareengineer.uz/swagger/v1/swagger.json',
  'https://najot-edu.softwareengineer.uz/v1/swagger.json'
];

async function fetchSwagger() {
  for (const url of urls) {
    try {
      console.log(`Trying ${url}...`);
      const data = await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          if (res.statusCode !== 200) {
            reject(`Status: ${res.statusCode}`);
            return;
          }
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(body));
        }).on('error', reject);
      });
      fs.writeFileSync('swagger.json', data);
      console.log(`Success! Saved swagger.json from ${url}`);
      return;
    } catch (e) {
      console.log(`Failed: ${e.message || e}`);
    }
  }
}

fetchSwagger();
