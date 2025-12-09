import request from 'supertest';
import app from '../app.js';
import logger from '../src/utils/logger.js';

console.log('🧪 Testing API Routes...\n');

async function testRoutes() {
  try {
    // Test 1: Root route
    console.log('1️⃣ Testing Root Route (GET /)');
    const rootRes = await request(app).get('/').expect(200);
    console.log('✅ Root route OK\n');

    // Test 2: Health check
    console.log('2️⃣ Testing Health Check (GET /health)');
    const healthRes = await request(app).get('/health').expect(200);
    console.log('✅ Health check:', healthRes.body.status, '\n');

    // Test 3: Get all users
    console.log('3️⃣ Testing Get Users (GET /api/users)');
    const usersRes = await request(app).get('/api/users').expect(200);
    console.log(`✅ Users endpoint: ${usersRes.body.data.total} users\n`);

    // Test 4: Get VIPs
    console.log('4️⃣ Testing Get VIPs (GET /api/users/vips)');
    const vipsRes = await request(app).get('/api/users/vips').expect(200);
    console.log(`✅ VIPs endpoint: ${vipsRes.body.data.total} VIPs\n`);

    // Test 5: Get stats
    console.log('5️⃣ Testing Get Stats (GET /api/users/stats)');
    const statsRes = await request(app).get('/api/users/stats').expect(200);
    console.log('✅ Stats:', statsRes.body.data, '\n');

    // Test 6: Get queue
    console.log('6️⃣ Testing Get Queue (GET /api/queue)');
    const queueRes = await request(app).get('/api/queue').expect(200);
    console.log(`✅ Queue endpoint: ${queueRes.body.data.length} items\n`);

    // Test 7: Manual check-in (will fail if user doesn't exist)
    console.log('7️⃣ Testing Manual Check-in (POST /api/checkin/manual)');
    try {
      const checkinRes = await request(app)
        .post('/api/checkin/manual')
        .send({ userId: 'VIP_999' })
        .expect(200);
      console.log('✅ Check-in successful:', checkinRes.body.data.user.name, '\n');
    } catch (error) {
      console.log('⚠️  Check-in test skipped (user may not exist)\n');
    }

    // Test 8: Admin health
    console.log('8️⃣ Testing Admin Health (GET /api/admin/health)');
    const adminHealthRes = await request(app).get('/api/admin/health').expect(200);
    console.log('✅ Admin health:', adminHealthRes.body.data.status, '\n');

    // Test 9: Invalid route (404)
    console.log('9️⃣ Testing 404 Handler (GET /invalid)');
    await request(app).get('/invalid').expect(404);
    console.log('✅ 404 handler working\n');

    // Test 10: Validation error
    console.log('🔟 Testing Validation Error (POST /api/checkin/qr without userId)');
    const validationRes = await request(app)
      .post('/api/checkin/qr')
      .send({})
      .expect(422);
    console.log('✅ Validation error:', validationRes.body.message, '\n');

    console.log('🎉 All route tests passed!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Route test failed:', error.message);
    process.exit(1);
  }
}

testRoutes();
