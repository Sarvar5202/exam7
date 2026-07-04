const axios = require('axios');
const BASE = 'https://najot-edu.softwareengineer.uz';

async function tryLogin(phone, password) {
  try {
    const res = await axios.post(`${BASE}/api/v1/auth/login`, { phone, password });
    console.log(`SUCCESS for phone: "${phone}", password: "${password}":`, res.data);
    return res.data;
  } catch (e) {
    console.log(`FAILED for phone: "${phone}", password: "${password}":`, e.response?.data?.message || e.message);
    return null;
  }
}

async function run() {
  await tryLogin('975661099', 'Benazir99!');
  await tryLogin('+998975661099', 'Benazir99!');
  await tryLogin('+998993737777', '1');
  await tryLogin('993737777', '1');
}

run();
