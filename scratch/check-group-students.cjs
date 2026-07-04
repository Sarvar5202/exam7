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
    console.log('Student token:', token);

    console.log('Fetching my groups...');
    const groupsRes = await axios.get(`${BASE}/api/v1/students/my/groups`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const groupId = groupsRes.data?.data?.[0]?.groupId || groupsRes.data?.[0]?.id;
    console.log('Group ID:', groupId);

    if (groupId) {
      console.log(`Fetching group students for group ${groupId}...`);
      const studentsRes = await axios.get(`${BASE}/api/v1/groups/one/students/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Status:', studentsRes.status);
      console.log('Students count:', studentsRes.data?.data?.length || studentsRes.data?.length || 0);
      console.log('First student:', JSON.stringify(studentsRes.data?.data?.[0] || studentsRes.data?.[0], null, 2));
    }
  } catch (e) {
    console.error('Error occurred:', e.response?.data || e.message);
  }
}

run();
