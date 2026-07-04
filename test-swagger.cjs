const axios = require('axios');
const BASE = 'https://najot-edu.softwareengineer.uz';

async function run() {
  const sw = await axios.get(`${BASE}/swagger-json`);
  const schemas = sw.data.components.schemas;
  console.log('CreateGroupDto:', schemas.CreateGroupDto);
}

run().catch(console.error);
