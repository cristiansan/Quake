// ── firebase-config.js ────────────────────────────────────────────────────────
// Fill in your Firebase project credentials.
// Firebase Console → Project Settings → General → Your Apps → Web app → SDK snippet
//
// After setting up, add these rules in Firebase Console → Realtime Database → Rules:
//   {
//     "rules": {
//       "sessions": {
//         "$sessionId": {
//           ".read":  true,
//           ".write": true
//         }
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
