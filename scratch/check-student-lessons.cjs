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

    console.log('Fetching groups...');
    const groupsRes = await axios.get(`${BASE}/api/v1/students/my/groups`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const groupId = groupsRes.data?.data?.[0]?.groupId || groupsRes.data?.[0]?.id;

    if (groupId) {
      console.log(`\n--- getMyGroupLessons /lessons/my/group/${groupId} ---`);
      const lessonsRes = await axios.get(`${BASE}/api/v1/lessons/my/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Status:', lessonsRes.status);
      console.log('Data:', JSON.stringify(lessonsRes.data, null, 2));

      console.log(`\n--- getGroupLessons /groups/${groupId}/lessons ---`);
      try {
        const lessons2Res = await axios.get(`${BASE}/api/v1/groups/${groupId}/lessons`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Status:', lessons2Res.status);
        console.log('Data:', JSON.stringify(lessons2Res.data, null, 2));
      } catch (e) {
        console.log('Error:', e.response?.data || e.message);
      }
    }
  } catch (e) {
    console.error('Error:', e.response?.data || e.message);
  }
}

run();
