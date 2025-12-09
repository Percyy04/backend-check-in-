import { db } from '../src/config/firebase.js';

console.log('🔍 Testing Firestore Direct Query...\n');

async function testDirectQuery() {
  try {
    // Test 1: Get all documents
    console.log('1️⃣ Getting all users from Firestore...');
    const snapshot = await db.collection('users').get();

    console.log(`   Total documents: ${snapshot.size}`);

    if (snapshot.empty) {
      console.log('   ❌ Collection is EMPTY!');
      console.log('   → Run: npm run seed');
    } else {
      console.log('   ✅ Found users!\n');

      snapshot.forEach(doc => {
        console.log(`   - ${doc.id}:`, doc.data());
      });
    }

    // Test 2: Check collection name
    console.log('\n2️⃣ Listing all collections...');
    const collections = await db.listCollections();
    console.log('   Available collections:');
    collections.forEach(col => {
      console.log(`   - ${col.id}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }

  process.exit(0);
}

testDirectQuery();
