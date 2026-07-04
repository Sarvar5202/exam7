const axios = require('axios');
const BASE = 'https://najot-edu.softwareengineer.uz';

async function run() {
  const loginRes = await axios.post(BASE + '/api/v1/auth/login', { phone: '+998901234567', password: 'admin' });
  const token = loginRes.data.accessToken;

  try {
    const r = await axios.post(`${BASE}/api/v1/groups`, {
      name: "Test",
      description: "",
      course_id: 1,
      room_id: 1,
      start_date: "2026-06-17",
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
    console.log("Error:", e.response?.data || e.message);
  }
}

run().catch(console.error);
