const axios = require('axios');
const BASE = 'https://najot-edu.softwareengineer.uz';

async function run() {
  try {
    console.log('Logging in as student...');
    const loginRes = await axios.post(`${BASE}/api/v1/auth/login`, {
      phone: '+998975661099',
      password: 'Benazir99!'
    });
    const token = loginRes.data.accessToken;
    console.log('Student login successful! Token:', token);

    console.log('Fetching my groups...');
    const groupsRes = await axios.get(`${BASE}/api/v1/students/my/groups`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Response status:', groupsRes.status);
    console.log('My Groups data:', JSON.stringify(groupsRes.data, null, 2));

  } catch (e) {
    console.error('Error occurred:', e.response?.data || e.message);
  }
}

run();
