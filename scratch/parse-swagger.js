import fs from 'fs';

const js = fs.readFileSync('scratch/swagger-init.txt', 'utf8');
const lines = js.split('\n');

// Print lines 908 to 985 (lesson endpoint)
console.log("=== /api/v1/groups/{groupId}/lesson endpoint ===");
for (let i = 905; i <= 985; i++) {
  console.log(`${i}: ${lines[i]}`);
}

// Print CreateLessonDto
console.log("\n=== CreateLessonDto ===");
for (let i = 2015; i <= 2055; i++) {
  console.log(`${i}: ${lines[i]}`);
}

// Print AttendanceItemDto
console.log("\n=== AttendanceItemDto ===");
for (let i = 2005; i <= 2020; i++) {
  console.log(`${i}: ${lines[i]}`);
}

// Print CreateAttendanceDto
console.log("\n=== CreateAttendanceDto ===");
for (let i = 2127; i <= 2170; i++) {
  console.log(`${i}: ${lines[i]}`);
}
