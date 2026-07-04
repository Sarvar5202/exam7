const axios = require('axios');
const BASE = 'https://najot-edu.softwareengineer.uz';

async function run() {
  const loginRes = await axios.post(BASE + '/api/v1/auth/login', { phone: '+998993737777', password: '1' });
  const token = loginRes.data.accessToken;

  try {
    // Get groups
    const gRes = await axios.get(`${BASE}/api/v1/students/my/groups`, { headers: { Authorization: `Bearer ${token}` } });
    const groups = gRes.data.data || gRes.data || [];
    const groupId = groups[0]?.group?.id || groups[0]?.id;
    console.log("Group ID:", groupId);

    if (groupId) {
      const lRes = await axios.get(`${BASE}/api/v1/lessons/my/group/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
      const lessons = lRes.data.data || lRes.data || [];
      const lessonId = lessons[0]?.id;
      console.log("Lesson ID:", lessonId);

      if (lessonId) {
        // Get teacher homework
        const hwRes = await axios.get(`${BASE}/api/v1/groups/${groupId}/lessons/${lessonId}/homeworks`, { headers: { Authorization: `Bearer ${token}` } });
        console.log("Teacher HW:", JSON.stringify(hwRes.data, null, 2));

        // Get own homework submission
        try {
          const ownRes = await axios.get(`${BASE}/api/v1/homework/own/${lessonId}`, { headers: { Authorization: `Bearer ${token}` } });
          console.log("Own HW:", JSON.stringify(ownRes.data, null, 2));
        } catch(e) {
          console.log("Own HW Error:", e.response?.data || e.message);
        }
      }
    }
  } catch(e) {
    console.log("Error:", e.response?.data || e.message);
  }
}

run().catch(console.error);
