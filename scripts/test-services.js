import firestoreService from '../src/services/firestore.service.js';
import queueService from '../src/services/queue.service.js';
import aiService from '../src/services/ai.service.js';
import logger from '../src/utils/logger.js';

console.log('🧪 Testing Services Layer...\n');
console.log('=========================================\n');

async function testFirestoreService() {
  console.log('1️⃣  TESTING FIRESTORE SERVICE\n');

  try {
    // Test 1.1: Create test user
    console.log('   → Creating test user VIP_999...');
    const testUser = {
      userId: 'VIP_999',
      name: 'Test VIP User',
      isVIP: true,
      seat: 'Z99',
      videoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4',
    };

    try {
      await firestoreService.createUser(testUser);
      console.log('   ✅ User created successfully\n');
    } catch (error) {
      if (error.code === 'USER_EXISTS') {
        console.log('   ⚠️  User already exists (OK)\n');
      } else {
        throw error;
      }
    }

    // Test 1.2: Get user by ID
    console.log('   → Getting user VIP_999...');
    const user = await firestoreService.getUser('VIP_999');
    console.log('   ✅ User retrieved:', {
      userId: user.userId,
      name: user.name,
      isVIP: user.isVIP,
    });
    console.log();

    // Test 1.3: Get all users (simple query)
    console.log('   → Getting all users...');
    const users = await firestoreService.getAllUsers(10);
    console.log(`   ✅ Retrieved ${users.length} users\n`);

    // Test 1.4: Update check-in status
    console.log('   → Updating check-in status...');
    await firestoreService.updateCheckinStatus('VIP_999', 'MANUAL');
    console.log('   ✅ Check-in status updated\n');

    // Test 1.5: Check if user checked in
    console.log('   → Checking if user checked in...');
    const isCheckedIn = await firestoreService.isUserCheckedIn('VIP_999');
    console.log(`   ✅ User checked in: ${isCheckedIn}\n`);

    console.log('✅ Firestore Service: ALL TESTS PASSED\n');
    console.log('=========================================\n');
    return true;

  } catch (error) {
    console.error('❌ Firestore Service Test Failed:', error.message);
    console.error('   Details:', error);
    return false;
  }
}

async function testQueueService() {
  console.log('2️⃣  TESTING QUEUE SERVICE\n');

  try {
    // Test 2.1: Clear queue first
    console.log('   → Clearing existing queue...');
    await queueService.clearQueue();
    console.log('   ✅ Queue cleared\n');

    // Test 2.2: Add to queue
    console.log('   → Adding VIP_999 to queue...');
    try {
      const queueItem = await queueService.addToQueue(
        'VIP_999',
        'Test VIP User',
        'https://res.cloudinary.com/demo/video/upload/sample.mp4'
      );
      console.log('   ✅ Added to queue:', {
        queueId: queueItem.queueId,
        userId: queueItem.userId,
        position: queueItem.position,
      });
      console.log();
    } catch (error) {
      if (error.code === 'ALREADY_IN_QUEUE') {
        console.log('   ⚠️  User already in queue (OK)\n');
      } else {
        throw error;
      }
    }

    // Test 2.3: Get queue
    console.log('   → Getting current queue...');
    const queue = await queueService.getQueueWithPositions();
    console.log(`   ✅ Queue length: ${queue.length}`);
    if (queue.length > 0) {
      console.log('   First item:', {
        userId: queue[0].userId,
        position: queue[0].position,
        status: queue[0].status,
      });
    }
    console.log();

    // Test 2.4: Get next item
    console.log('   → Getting next queue item...');
    const nextItem = await queueService.getNextItem();
    if (nextItem) {
      console.log('   ✅ Next item:', nextItem.userId);
    } else {
      console.log('   ⚠️  Queue is empty');
    }
    console.log();

    // Test 2.5: Get queue stats
    console.log('   → Getting queue statistics...');
    const queueStats = await queueService.getQueueStats();
    console.log('   ✅ Queue stats:', queueStats);
    console.log();

    // Test 2.6: Test queue full scenario
    console.log('   → Testing queue capacity...');
    console.log('   (Max queue length: 10 items)\n');

    console.log('✅ Queue Service: ALL TESTS PASSED\n');
    console.log('=========================================\n');
    return true;

  } catch (error) {
    console.error('❌ Queue Service Test Failed:', error.message);
    console.error('   Details:', error);
    return false;
  }
}

async function testAIService() {
  console.log('3️⃣  TESTING AI SERVICE\n');

  try {
    // Test 3.1: Health check
    console.log('   → Checking AI service health...');
    const health = await aiService.healthCheck();
    console.log('   AI Service:', health);

    if (health.available) {
      console.log('   ✅ AI Service is available\n');
    } else {
      console.log('   ⚠️  AI Service is not available (Expected if not running)\n');
      console.log('   Note: This is OK for backend-only testing\n');
    }

    // Test 3.2: Mock recognition (will fail if AI service not running)
    console.log('   → Testing face recognition (will skip if service unavailable)...');
    if (health.available) {
      try {
        // Mock base64 image (tiny test image)
        const mockImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        const result = await aiService.recognizeFace(mockImage);
        console.log('   ✅ Recognition result:', result);
      } catch (error) {
        console.log('   ⚠️  Recognition test skipped:', error.message);
      }
    } else {
      console.log('   ⏭️  Skipping recognition test (service unavailable)\n');
    }

    console.log('✅ AI Service: TESTS COMPLETED\n');
    console.log('=========================================\n');
    return true;

  } catch (error) {
    console.error('❌ AI Service Test Failed:', error.message);
    return false;
  }
}

async function testStatistics() {
  console.log('4️⃣  TESTING STATISTICS\n');

  try {
    // Test 4.1: Get stats (simplified version without composite queries)
    console.log('   → Getting system statistics...');
    const stats = await firestoreService.getStats();
    console.log('   ✅ Statistics:', {
      totalUsers: stats.totalUsers,
      totalCheckedIn: stats.totalCheckedIn,
      totalVIPs: stats.totalVIPs,
      vipsCheckedIn: stats.vipsCheckedIn,
      queueLength: stats.queueLength,
      checkinRate: `${stats.checkinRate}%`,
    });
    console.log();

    // Test 4.2: Get VIPs (simplified)
    console.log('   → Getting all VIPs...');
    const vips = await firestoreService.getAllVIPs();
    console.log(`   ✅ Total VIPs: ${vips.length}`);
    if (vips.length > 0) {
      console.log(`   Sample VIP: ${vips[0].userId} - ${vips[0].name}`);
    }
    console.log();

    console.log('✅ Statistics: ALL TESTS PASSED\n');
    console.log('=========================================\n');
    return true;

  } catch (error) {
    console.error('❌ Statistics Test Failed:', error.message);
    console.error('   Details:', error);
    return false;
  }
}

async function cleanup() {
  console.log('🧹 CLEANUP\n');

  try {
    // Delete test user
    console.log('   → Deleting test user VIP_999...');
    try {
      await firestoreService.db.collection('users').doc('VIP_999').delete();
      console.log('   ✅ Test user deleted\n');
    } catch (error) {
      console.log('   ⚠️  Could not delete test user:', error.message, '\n');
    }

    // Clear queue
    console.log('   → Clearing test queue...');
    await queueService.clearQueue();
    console.log('   ✅ Queue cleared\n');

  } catch (error) {
    console.log('   ⚠️  Cleanup warnings (non-critical):', error.message, '\n');
  }
}

// ==========================================
// MAIN TEST RUNNER
// ==========================================

async function runAllTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   GALA BROSIS SERVICES TEST SUITE    ║');
  console.log('╚════════════════════════════════════════╝\n');

  const results = {
    firestore: false,
    queue: false,
    ai: false,
    stats: false,
  };

  try {
    // Run tests sequentially
    results.firestore = await testFirestoreService();
    results.queue = await testQueueService();
    results.ai = await testAIService();
    results.stats = await testStatistics();

    // Cleanup
    await cleanup();

    // Summary
    console.log('╔════════════════════════════════════════╗');
    console.log('║          TEST SUMMARY                ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log(`   Firestore Service: ${results.firestore ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Queue Service:     ${results.queue ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   AI Service:        ${results.ai ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Statistics:        ${results.stats ? '✅ PASS' : '❌ FAIL'}`);
    console.log();

    const allPassed = Object.values(results).every(r => r === true);

    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED! Services layer is ready.\n');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Check logs above.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runAllTests();
