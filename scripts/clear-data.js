import { db } from '../src/config/firebase.js';
import logger from '../src/utils/logger.js';

console.log('🗑️  Clearing All Data...\n');
console.log('⚠️  WARNING: This will delete ALL users and queue items!');
console.log('Press Ctrl+C within 5 seconds to cancel...\n');

await new Promise(resolve => setTimeout(resolve, 5000));

async function clearData() {
  try {
    // Clear users
    console.log('Deleting users...');
    const usersSnapshot = await db.collection('users').get();
    const usersBatch = db.batch();
    usersSnapshot.docs.forEach(doc => {
      usersBatch.delete(doc.ref);
    });
    await usersBatch.commit();
    console.log(`✅ Deleted ${usersSnapshot.size} users\n`);

    // Clear queue
    console.log('Deleting queue items...');
    const queueSnapshot = await db.collection('checkin_queue').get();
    const queueBatch = db.batch();
    queueSnapshot.docs.forEach(doc => {
      queueBatch.delete(doc.ref);
    });
    await queueBatch.commit();
    console.log(`✅ Deleted ${queueSnapshot.size} queue items\n`);

    console.log('🎉 All data cleared!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Clear failed:', error.message);
    process.exit(1);
  }
}

clearData();
