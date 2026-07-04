const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const BASE = 'https://najot-edu.softwareengineer.uz';

async function run() {
  try {
    console.log('1. Student login');
    const stLogin = await axios.post(BASE + '/api/v1/auth/login', { phone: '+998906972007', password: 'Jon19988' });
    const stToken = stLogin.data.accessToken;

    console.log('2. Submit homework answer as student');
    const form = new FormData();
    form.append('title', 'My test answer');
    fs.writeFileSync('dummy.txt', 'test content');
    form.append('file', fs.createReadStream('dummy.txt'));
    
    let answerId;
    try {
      const submitRes = await axios.post(BASE + '/api/v1/students/homeworkAnswer/287', form, { 
        headers: { ...form.getHeaders(), Authorization: 'Bearer ' + stToken } 
      });
      console.log('Submit res status:', submitRes.status);
    } catch(e) {
      if (e.response?.status === 400 && e.response?.data?.message === "You already submitted an answer for this homework") {
        console.log('Answer already submitted.');
      } else {
        throw e;
      }
    }

    console.log('3. Admin login');
    const adLogin = await axios.post(BASE + '/api/v1/auth/login', { phone: '+998901234567', password: 'admin' });
    const adToken = adLogin.data.accessToken;

    console.log('4. Get results as admin');
    const resultsRes = await axios.get(BASE + '/api/v1/group/67/homework/287/results?status=PENDING', { 
      headers: { Authorization: 'Bearer ' + adToken } 
    });
    const pendingList = resultsRes.data.data || resultsRes.data || [];
    console.log('Pending answers:', pendingList.length);
    
    // Fallback: Check if it's already graded (ACCEPTED or CHECKED)
    let ans = pendingList.find(a => a.student?.phone === '+998906972007' || a.phone === '+998906972007' || a.id);
    if (!ans) {
      const gradedRes = await axios.get(BASE + '/api/v1/group/67/homework/287/results?status=CHECKED', { 
        headers: { Authorization: 'Bearer ' + adToken } 
      });
      const gradedList = gradedRes.data.data || gradedRes.data || [];
      ans = gradedList.find(a => a.student?.phone === '+998906972007' || a.phone === '+998906972007' || a.id);
    }

    if (ans) {
      answerId = ans.id;
      console.log('Found answer ID:', answerId);
      
      console.log('5. Grade homework as admin');
      await axios.post(BASE + '/api/v1/group/67/homework/287/check', { 
        grade: 95, 
        title: 'Very good job', 
        homework_answer_id: answerId 
      }, { 
        headers: { Authorization: 'Bearer ' + adToken } 
      });
      console.log('Graded successfully');
    } else {
      console.log('Could not find answer in any list');
    }

    console.log('6. Check student result again');
    const hwRes = await axios.get(BASE + '/api/v1/groups/67/lessons/283/homeworks', { 
      headers: { Authorization: 'Bearer ' + stToken } 
    });
    console.log('STUDENT FINAL HW DATA:', JSON.stringify(hwRes.data, null, 2));

  } catch(e) {
    console.log('ERROR:', e.response?.status, JSON.stringify(e.response?.data) || e.message);
  }
}

run();
