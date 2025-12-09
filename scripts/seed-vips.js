import firestoreService from '../src/services/firestore.service.js';
import logger from '../src/utils/logger.js';

console.log('🌱 Seeding VIP Data...\n');

// Mock data: 20 VIPs cho Gala Brosis 2025
const vipData = [
  {
    userId: 'VIP_001',
    name: 'Nguyễn Văn A',
    isVIP: true,
    seat: 'A01',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_001.mp4',
    email: 'nguyenvana@example.com',
    phone: '0901234567',
  },
  {
    userId: 'VIP_002',
    name: 'Trần Thị B',
    isVIP: true,
    seat: 'A02',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_002.mp4',
    email: 'tranthib@example.com',
    phone: '0901234568',
  },
  {
    userId: 'VIP_003',
    name: 'Lê Văn C',
    isVIP: true,
    seat: 'A03',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_003.mp4',
    email: 'levanc@example.com',
    phone: '0901234569',
  },
  {
    userId: 'VIP_004',
    name: 'Phạm Thị D',
    isVIP: true,
    seat: 'A04',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_004.mp4',
    email: 'phamthid@example.com',
    phone: '0901234570',
  },
  {
    userId: 'VIP_005',
    name: 'Hoàng Văn E',
    isVIP: true,
    seat: 'A05',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_005.mp4',
    email: 'hoangvane@example.com',
    phone: '0901234571',
  },
  {
    userId: 'VIP_006',
    name: 'Đỗ Thị F',
    isVIP: true,
    seat: 'A06',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_006.mp4',
    email: 'dothif@example.com',
    phone: '0901234572',
  },
  {
    userId: 'VIP_007',
    name: 'Vũ Văn G',
    isVIP: true,
    seat: 'A07',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_007.mp4',
    email: 'vuvang@example.com',
    phone: '0901234573',
  },
  {
    userId: 'VIP_008',
    name: 'Bùi Thị H',
    isVIP: true,
    seat: 'A08',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_008.mp4',
    email: 'buithih@example.com',
    phone: '0901234574',
  },
  {
    userId: 'VIP_009',
    name: 'Đặng Văn I',
    isVIP: true,
    seat: 'A09',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_009.mp4',
    email: 'dangvani@example.com',
    phone: '0901234575',
  },
  {
    userId: 'VIP_010',
    name: 'Ngô Thị K',
    isVIP: true,
    seat: 'A10',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_010.mp4',
    email: 'ngothik@example.com',
    phone: '0901234576',
  },
  {
    userId: 'VIP_011',
    name: 'Dương Văn L',
    isVIP: true,
    seat: 'B01',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_011.mp4',
    email: 'duongvanl@example.com',
    phone: '0901234577',
  },
  {
    userId: 'VIP_012',
    name: 'Cao Thị M',
    isVIP: true,
    seat: 'B02',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_012.mp4',
    email: 'caothim@example.com',
    phone: '0901234578',
  },
  {
    userId: 'VIP_013',
    name: 'Lý Văn N',
    isVIP: true,
    seat: 'B03',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_013.mp4',
    email: 'lyvann@example.com',
    phone: '0901234579',
  },
  {
    userId: 'VIP_014',
    name: 'Tô Thị O',
    isVIP: true,
    seat: 'B04',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_014.mp4',
    email: 'tothio@example.com',
    phone: '0901234580',
  },
  {
    userId: 'VIP_015',
    name: 'Đinh Văn P',
    isVIP: true,
    seat: 'B05',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_015.mp4',
    email: 'dinhvanp@example.com',
    phone: '0901234581',
  },
  {
    userId: 'VIP_016',
    name: 'Hồ Thị Q',
    isVIP: true,
    seat: 'B06',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_016.mp4',
    email: 'hothiq@example.com',
    phone: '0901234582',
  },
  {
    userId: 'VIP_017',
    name: 'Mai Văn R',
    isVIP: true,
    seat: 'B07',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_017.mp4',
    email: 'maivanr@example.com',
    phone: '0901234583',
  },
  {
    userId: 'VIP_018',
    name: 'Phan Thị S',
    isVIP: true,
    seat: 'B08',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_018.mp4',
    email: 'phanthis@example.com',
    phone: '0901234584',
  },
  {
    userId: 'VIP_019',
    name: 'Võ Văn T',
    isVIP: true,
    seat: 'B09',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_019.mp4',
    email: 'vovant@example.com',
    phone: '0901234585',
  },
  {
    userId: 'VIP_020',
    name: 'Trịnh Thị U',
    isVIP: true,
    seat: 'B10',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/gala-brosis/vip_020.mp4',
    email: 'trinhthiu@example.com',
    phone: '0901234586',
  },
];

async function seedVIPs() {
  try {
    console.log(`📥 Importing ${vipData.length} VIPs...\n`);

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const vip of vipData) {
      try {
        await firestoreService.createUser(vip);
        console.log(`✅ Created: ${vip.userId} - ${vip.name}`);
        created++;
      } catch (error) {
        if (error.code === 'USER_EXISTS') {
          console.log(`⏭️  Skipped: ${vip.userId} (already exists)`);
          skipped++;
        } else {
          console.error(`❌ Failed: ${vip.userId} - ${error.message}`);
          failed++;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SEED SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Created:  ${created}`);
    console.log(`⏭️  Skipped:  ${skipped} (already existed)`);
    console.log(`❌ Failed:   ${failed}`);
    console.log(`📦 Total:    ${vipData.length}`);
    console.log('='.repeat(50) + '\n');

    if (failed === 0) {
      console.log('🎉 Seed completed successfully!\n');
      process.exit(0);
    } else {
      console.log('⚠️  Seed completed with some failures.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    logger.error('Seed failed', { error: error.stack });
    process.exit(1);
  }
}

// Run seed
seedVIPs();
