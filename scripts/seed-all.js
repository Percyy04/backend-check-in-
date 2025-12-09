import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🌱 Seeding All Data...\n');

async function seedAll() {
  try {
    // Seed VIPs
    console.log('1️⃣ Seeding VIPs...');
    await execAsync('node scripts/seed-vips.js');
    console.log('✅ VIPs seeded\n');

    // Seed Staff
    console.log('2️⃣ Seeding Staff/Guests...');
    await execAsync('node scripts/seed-staff.js');
    console.log('✅ Staff/Guests seeded\n');

    console.log('🎉 All data seeded successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seedAll();
