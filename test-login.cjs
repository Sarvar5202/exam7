const axios = require('axios');

async function testLogin() {
  try {
    const loginRes = await axios.post('https://najot-edu.softwareengineer.uz/api/v1/auth/login', {
      phone: '+998993737777',
      password: '1'
    });
    
    if (loginRes.data.role === 'STUDENT') {
      const token = loginRes.data.accessToken;
      const groupsRes = await axios.get('https://najot-edu.softwareengineer.uz/api/v1/students/my/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const firstGroup = groupsRes.data?.data?.[0] || groupsRes.data?.[0];
      const groupId = firstGroup?.groupId || firstGroup?.id;
      
      if (groupId) {
        console.log(`\n--- LESSONS FOR GROUP ${groupId} ---`);
        try {
          const lessonsRes = await axios.get(`https://najot-edu.softwareengineer.uz/api/v1/lessons/my/group/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Lessons Length:', lessonsRes.data?.data?.length || lessonsRes.data?.length);
          console.log('First Lesson:', JSON.stringify(lessonsRes.data?.data?.[0] || lessonsRes.data?.[0], null, 2));
        } catch (err) {
          console.log('Lessons Error:', err.response?.data || err.message);
        }
      } else {
        console.log('No groupId found to fetch lessons.');
      }
    }
  } catch (e) {
    console.log('Error:', e.response?.data || e.message);
  }
}

testLogin();
