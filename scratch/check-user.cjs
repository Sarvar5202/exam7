const axios = require('axios');
const BASE = 'https://najot-edu.softwareengineer.uz';

async function run() {
  try {
    console.log('Logging in as admin...');
    const loginRes = await axios.post(BASE + '/api/v1/auth/login', { phone: '+998901234567', password: 'admin' });
    const token = loginRes.data.accessToken;
    console.log('Admin login successful!');

    console.log('Fetching students list...');
    const studentsRes = await axios.get(`${BASE}/api/v1/students`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`Found ${studentsRes.data?.data?.length || studentsRes.data?.length || 0} students.`);
    const students = studentsRes.data?.data || studentsRes.data || [];
    
    const targetStudent = students.find(s => s.phone === '+998993737777' || s.phone?.includes('3737777'));
    if (targetStudent) {
      console.log('Target Student found:', JSON.stringify(targetStudent, null, 2));
    } else {
      console.log('Student +998993737777 not found in the list. Here is the full list of students:');
      console.log(JSON.stringify(students, null, 2));
    }
  } catch (e) {
    console.error('Error occurred:', e.response?.data || e.message);
  }
}

run();
