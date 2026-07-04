const axios = require('axios');
const BASE = 'https://najot-edu.softwareengineer.uz';

async function run() {
  const loginRes = await axios.post(BASE + '/api/v1/auth/login', { phone: '+998901234567', password: 'admin' });
  const token = loginRes.data.accessToken;

  try {
    const r = await axios.post(`${BASE}/api/v1/groups`, {
      name: "Test Group",
      description: "Test Group",
      course_id: 1,
      room_id: 1,
      start_date: new Date("2026-06-17").toISOString(),
      start_time: "09:00",
      max_student: 15,
      week_day: ["MONDAY"],
      teachers: [],
      students: []
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success", r.data);
  } catch(e) {
    console.log("Error:", JSON.stringify(e.response?.data || e.message, null, 2));
  }
}

run().catch(console.error);
