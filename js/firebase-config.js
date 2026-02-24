// ── firebase-config.js ────────────────────────────────────────────────────────
// Fill in your Firebase project credentials.
// Firebase Console → Project Settings → General → Your Apps → Web app → SDK snippet
//
// SETUP REQUIRED IN FIREBASE CONSOLE:
//
// 1. Authentication → Sign-in method → Enable "Email/Password"
//
// 2. Realtime Database → Rules → paste:
//   {
//     "rules": {
//       "sessions": {
//         "$sessionId": { ".read": true, ".write": true }
//       },
//       "matches": {
//         ".read": true,
//         ".write": "auth != null && auth.token.email == 'cristiansan@gmail.com'",
//         "$matchId": {
//           ".write": "auth != null"
//         }
//       }
//     }
//   }
//   (any logged-in user can save matches; only admin email can delete the whole ranking)
//
// 4. Storage → Rules → paste:
//   rules_version = '2';
//   service firebase.storage {
//     match /b/{bucket}/o {
//       match /matches/{matchId}/screenshots/{filename} {
//         allow read: true;
//         allow write: if request.auth != null
//                      && request.resource.size <= 1 * 1024 * 1024
//                      && request.resource.contentType.matches('image/.*');
//       }
//     }
//   }
// ─────────────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            'AIzaSyD5o0SLRyMTWlg9jnt7YFaVHoyRRGMQCMk',
  authDomain:        'quake-6f8f7.firebaseapp.com',
  databaseURL:       'https://quake-6f8f7-default-rtdb.firebaseio.com',
  projectId:         'quake-6f8f7',
  storageBucket:     'quake-6f8f7.firebasestorage.app',
  messagingSenderId: '1016017258999',
  appId:             '1:1016017258999:web:d85f669c0011f0e54b86f2',
};

firebase.initializeApp(firebaseConfig);
