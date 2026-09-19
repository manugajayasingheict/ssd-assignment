// src/utils/errorMessages.js

export const getCustomErrorMessage = (error) => {
  const errorCode = error.code || error.message;

  // Firebase Auth Errors
  const authErrors = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Contact support.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
    'auth/popup-closed-by-user': 'Sign-in cancelled.',
    'auth/cancelled-popup-request': 'Sign-in cancelled.',
    'auth/requires-recent-login': 'Please log in again to continue.',
    'auth/invalid-credential': 'Invalid login credentials. Please check your email and password.',
  };

  // Firebase Storage Errors
  const storageErrors = {
    'storage/unauthorized': 'You do not have permission to upload files.',
    'storage/canceled': 'Upload cancelled.',
    'storage/unknown': 'An error occurred during upload.',
    'storage/object-not-found': 'File not found.',
    'storage/quota-exceeded': 'Storage quota exceeded.',
  };

  // Firebase Firestore Errors
  const firestoreErrors = {
    'permission-denied': 'You do not have permission to access this data.',
    'not-found': 'The requested data was not found.',
    'already-exists': 'This record already exists.',
    'failed-precondition': 'Operation failed. Please try again.',
    'unavailable': 'Service temporarily unavailable. Please try again.',
  };

  // Check all error types
  if (authErrors[errorCode]) return authErrors[errorCode];
  if (storageErrors[errorCode]) return storageErrors[errorCode];
  if (firestoreErrors[errorCode]) return firestoreErrors[errorCode];

  // Default friendly message
  return 'Something went wrong. Please try again.';
};