#!/usr/bin/env node
/**
 * Deploy Firestore Indexes
 * Run: node scripts/deploy-firestore-indexes.js
 */

import admin from 'firebase-admin';
import { config } from '../src/config/env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = {
  projectId: config.firebase.projectId,
  privateKey: config.firebase.privateKey,
  clientEmail: config.firebase.clientEmail,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Read indexes configuration
const indexesPath = path.join(__dirname, '../firestore.indexes.json');
const indexesConfig = JSON.parse(fs.readFileSync(indexesPath, 'utf8'));

async function deployIndexes() {
  try {
    console.log('📋 Deploying Firestore indexes...\n');

    // List existing indexes
    console.log('📊 Checking existing indexes...');
    const existingIndexes = await db.listIndexes();
    console.log(`Found ${existingIndexes.indexes.length} existing indexes\n`);

    // Deploy each index from config
    for (const indexConfig of indexesConfig.indexes) {
      const fields = indexConfig.fields.map(f => `${f.fieldPath} (${f.order})`).join(', ');
      const displayName = `${indexConfig.collectionGroup}: [${fields}]`;

      console.log(`🔄 Processing index: ${displayName}`);

      // Check if index already exists
      const exists = existingIndexes.indexes.some(idx =>
        idx.collectionGroup === indexConfig.collectionGroup &&
        JSON.stringify(idx.fields) === JSON.stringify(indexConfig.fields)
      );

      if (exists) {
        console.log(`   ✅ Index already exists\n`);
      } else {
        console.log(`   ⏳ Creating index...`);
        // Note: Creating indexes programmatically is limited
        // Recommend using Firebase CLI instead
        console.log(`   ℹ️  Use Firebase CLI: firebase deploy --only firestore:indexes\n`);
      }
    }

    console.log('✨ Index deployment check complete!');
    console.log('\n📝 For production deployment, run:');
    console.log('   firebase deploy --only firestore:indexes\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error deploying indexes:', error.message);
    process.exit(1);
  }
}

deployIndexes();
