import firestoreService from '../src/services/firestore.service.js';
import logger from '../src/utils/logger.js';

console.log('🌱 Seeding Staff Data...\n');

// Mock data: 10 Staff members
const staffData = [
  {
    userId: 'STAFF_001',
    name: 'Nhân viên Kỹ Thuật A',
    isVIP: false,
    seat: 'C01',
    email: 'staffa@example.com',
  },
  {
    userId: 'STAFF_002',
    name: 'Nhân viên Kỹ Thuật B',
    isVIP: false,
    seat: 'C02',
    email: 'staffb@example.com',
  },
  {
    userId: 'STAFF_003',
    name: 'Nhân viên Tổ Chức C',
    isVIP: false,
    seat: 'C03',
    email: 'staffc@example.com',
  },
  {
    userId: 'STAFF_004',
    name: 'Nhân viên Tổ Chức D',
    isVIP: false,
    seat: 'C04',
    email: 'staffd@example.com',
  },
  {
    userId: 'STAFF_005',
    name: 'Nhân viên An Ninh E',
    isVIP: false,
    seat: 'C05',
    email: 'staffe@example.com',
  },
  {
    userId: 'GUEST_001',
    name: 'Khách mời F',
    isVIP: false,
    seat: 'D01',
    email: 'guestf@example.com',
  },
  {
    userId: 'GUEST_002',
    name: 'Khách mời G',
    isVIP: false,
    seat: 'D02',
    email: 'guestg@example.com',
  },
  {
    userId: 'GUEST_003',
    name: 'Khách mời H',
    isVIP: false,
    seat: 'D03',
    email: 'guesth@example.com',
  },
  {
    userId: 'GUEST_004',
    name: 'Khách mời I',
    isVIP: false,
    seat: 'D04',
    email: 'guesti@example.com',
  },
  {
    userId: 'GUEST_005',
    name: 'Khách mời J',
    isVIP: false,
    seat: 'D05',
    email: 'guestj@example.com',
  },
];

async function seedStaff() {
  try {
    console.log(`📥 Importing ${staffData.length} Staff/Guests...\n`);

    let created = 0;
    let skipped = 0;

    for (const user of staffData) {
      try {
        await firestoreService.createUser(user);
        console.log(`✅ Created: ${user.userId} - ${user.name}`);
        created++;
      } catch (error) {
        if (error.code === 'USER_EXISTS') {
          console.log(`⏭️  Skipped: ${user.userId}`);
          skipped++;
        } else {
          throw error;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SEED SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Created:  ${created}`);
    console.log(`⏭️  Skipped:  ${skipped}`);
    console.log('='.repeat(50) + '\n');
    console.log('🎉 Staff seed completed!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seedStaff();
