import axios from 'axios';
import fs from 'fs';

async function check() {
  const res = await axios.get('https://najot-edu.softwareengineer.uz/swagger/swagger-ui-init.js');
  const js = res.data;
  
  // Save to file for inspection
  fs.writeFileSync('scratch/swagger-init.txt', js);
  
  // Find all paths that contain "lesson" anywhere in the text
  const lines = js.split('\n');
  lines.forEach((line, i) => {
    if (line.toLowerCase().includes('lesson') || line.toLowerCase().includes('groups') || line.toLowerCase().includes('attendance')) {
      console.log(`Line ${i}: ${line.trim()}`);
    }
  });
}

check().catch(console.error);
