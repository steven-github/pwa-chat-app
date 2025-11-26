/**
 * Firebase Firestore Initialization Helper
 * 
 * This is the EASIEST way to create collections:
 * 
 * 1. In your app component or main.tsx, after Firebase initializes:
 * 2. Call: await firebaseInit()
 * 3. Done! Collections are created
 * 
 * Usage:
 * import { firebaseInit } from './utils/firestoreSetup'
 * import { db } from './config/firebase'
 * await firebaseInit(db)
 */

import type { Firestore } from 'firebase/firestore';
import { writeBatch, doc, collection } from 'firebase/firestore';

export async function firebaseInit(db: Firestore) {
  const batch = writeBatch(db);

  try {
    console.log('🚀 Creating Firestore collections...');

    // Create users collection
    batch.set(doc(collection(db, 'users'), '__example__'), {
      email: 'example@test.com',
      displayName: 'Example User',
      subscriptionStatus: 'free',
      createdAt: new Date(),
    });

    // Create rooms collection
    batch.set(doc(collection(db, 'rooms'), '__example__'), {
      name: 'Example Room',
      description: 'This is an example room',
      createdBy: '__example__',
      createdAt: new Date(),
      memberCount: 1,
      latitude: 40.7128,
      longitude: -74.006,
      radius: 10,
      isPrivate: false,
    });

    // Create messages collection
    batch.set(doc(collection(db, 'messages'), '__example__'), {
      roomId: '__example__',
      userId: '__example__',
      userName: 'Example User',
      text: 'Hello! This is an example message.',
      timestamp: new Date(),
    });

    // Create subscriptions collection
    batch.set(doc(collection(db, 'subscriptions'), '__example__'), {
      userId: '__example__',
      plan: 'free',
      status: 'active',
      createdAt: new Date(),
    });

    // Create payments collection
    batch.set(doc(collection(db, 'payments'), '__example__'), {
      userId: '__example__',
      amount: 0,
      status: 'completed',
      createdAt: new Date(),
    });

    await batch.commit();

    console.log('✅ Collections created successfully!');
    console.log('\n📋 Created collections:');
    console.log('  ✓ users');
    console.log('  ✓ rooms');
    console.log('  ✓ messages');
    console.log('  ✓ subscriptions');
    console.log('  ✓ payments');
    console.log('\n⚠️  Next steps:');
    console.log('  1. Check Firebase Console to verify collections');
    console.log('  2. Delete __example__ documents (optional)');
    console.log('  3. Update Firestore Security Rules (see SETUP_GUIDE.md)');

    return true;
  } catch (error) {
    console.error('❌ Error creating collections:', error);
    throw error;
  }
}

/**
 * Delete example documents
 */
export async function cleanupExamples(db: Firestore) {
  const batch = writeBatch(db);

  try {
    console.log('🧹 Deleting example documents...');

    batch.delete(doc(db, 'users', '__example__'));
    batch.delete(doc(db, 'rooms', '__example__'));
    batch.delete(doc(db, 'messages', '__example__'));
    batch.delete(doc(db, 'subscriptions', '__example__'));
    batch.delete(doc(db, 'payments', '__example__'));

    await batch.commit();
    console.log('✅ Example documents deleted!');

    return true;
  } catch (error) {
    console.error('❌ Error deleting examples:', error);
    throw error;
  }
}
