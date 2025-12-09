import { db } from '../src/config/firebase.js';

async function testFirebaseConnection() {
  try {
    console.log('🧪 Testing Firebase connection...\n');

    // Test 1: Write test document
    const testRef = db.collection('_test').doc('connection_test');
    await testRef.set({
      timestamp: new Date(),
      message: 'Firebase connection test',
    });
    console.log('✅ Write test: SUCCESS');

    // Test 2: Read test document
    const snapshot = await testRef.get();
    if (snapshot.exists) {
      console.log('✅ Read test: SUCCESS');
      console.log('📄 Data:', snapshot.data());
    }

    // Test 3: Delete test document
    await testRef.delete();
    console.log('✅ Delete test: SUCCESS');

    console.log('\n🎉 Firebase connection is working perfectly!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    process.exit(1);
  }
}

testFirebaseConnection();
