// Run inside the Firestore emulator. No production Firebase access is used.
const fs = require('node:fs');
const path = require('node:path');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, setDoc, updateDoc } = require('firebase/firestore');

// The original /users rule supplied in the assignment, isolated for the PoC.
const oldRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == userId ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin");
    }
  }
}`;

const fixedRules = fs.readFileSync(path.join(__dirname, 'firestore.rules'), 'utf8');

async function withRules(projectId, rules, test) {
  const environment = await initializeTestEnvironment({
    projectId,
    firestore: { rules },
  });
  try {
    await environment.clearFirestore();
    await environment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users', 'test-student'), {
        role: 'student', isVerified: false, batch: '2026 AL', fullName: 'Student',
      });
      await setDoc(doc(context.firestore(), 'users', 'test-admin'), {
        role: 'admin', isVerified: true, batch: '2026 AL', fullName: 'Admin',
      });
    });
    await test(environment);
  } finally {
    await environment.cleanup();
  }
}

async function main() {
  await withRules('demo-ssd', oldRules, async (env) => {
    const student = env.authenticatedContext('test-student', { email_verified: false });
    await assertSucceeds(updateDoc(doc(student.firestore(), 'users', 'test-student'), {
      isVerified: true,
    }));
    console.log('BEFORE: unverified student changed isVerified to true -> ALLOWED');
  });

  await withRules('demo-ssd', fixedRules, async (env) => {
    const student = env.authenticatedContext('test-student', { email_verified: false });
    const admin = env.authenticatedContext('test-admin', { email_verified: true });
    const user = doc(student.firestore(), 'users', 'test-student');

    await assertFails(updateDoc(user, { isVerified: true }));
    console.log('AFTER: student change to isVerified -> DENIED');

    await assertFails(updateDoc(user, { role: 'admin' }));
    console.log('AFTER: student change to role -> DENIED');

    await assertFails(updateDoc(user, { batch: '2027 AL' }));
    console.log('AFTER: student change to batch -> DENIED');

    await assertSucceeds(updateDoc(user, { fullName: 'Updated Student' }));
    console.log('AFTER: normal profile update -> ALLOWED');

    await assertSucceeds(updateDoc(doc(admin.firestore(), 'users', 'test-student'), {
      isVerified: true,
    }));
    console.log('AFTER: admin change to Firestore isVerified -> ALLOWED');
  });
  console.log('PASS: all Firestore emulator assertions passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
