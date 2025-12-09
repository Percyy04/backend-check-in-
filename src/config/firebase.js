import admin from 'firebase-admin';
import { config } from './env.js';

// Tạo service account credentials từ env vars
const serviceAccount = {
  projectId: config.firebase.projectId,
  privateKey: config.firebase.privateKey,
  clientEmail: config.firebase.clientEmail,
};

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Export Firestore & Auth instances
export const db = admin.firestore();
export const auth = admin.auth();

// Firestore settings (optional)
db.settings({
  ignoreUndefinedProperties: true, // Bỏ qua undefined fields khi write
});

console.log('✅ Firebase Admin SDK initialized');

export default admin;
