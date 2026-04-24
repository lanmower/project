import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { exec } from 'child_process';
import { promisify } from 'util';

// Initialize Firebase app
initializeApp();

const db = getFirestore();
const execPromise = promisify(exec);

async function setupFirestore() {
  // Create initial superuser
  await db.collection('users').doc('admin').set({
    uid: 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
    role: 'superuser'
  });

  // Create default processing rules
  await db.collection('rules').add({
    name: 'High Priority Emails',
    conditions: [
      {
        field: 'subject',
        operator: 'contains',
        value: 'urgent'
      }
    ],
    actions: [
      {
        type: 'tag',
        value: 'high-priority'
      },
      {
        type: 'todo',
        value: 'Review urgent email',
        todoCategory: 'Urgent'
      }
    ],
    isActive: true
  });

  // Create example email categories
  const categories = ['General', 'Urgent', 'Follow-up', 'Reports'];
  for (const category of categories) {
    await db.collection('emailCategories').add({
      name: category,
      createdAt: new Date()
    });
  }

  console.log('✅ Firestore setup completed');

  // Deploy Firestore indexes
  await deployIndexes();
}

async function deployIndexes() {
  try {
    await execPromise('firebase deploy --only firestore:indexes');
    console.log('✅ Firestore indexes deployed successfully');
  } catch (error) {
    console.error('❌ Failed to deploy Firestore indexes:', error);
  }
}

async function main() {
  try {
    await setupFirestore();
    console.log('🚀 Setup completed successfully');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

main();