// ── auth.js ───────────────────────────────────────────────────────────────────
// Shared Firebase Auth utilities.
// Must be loaded after firebase-app-compat.js, firebase-auth-compat.js, and firebase-config.js.
// ─────────────────────────────────────────────────────────────────────────────

window.QuakeAuth = (function () {

  /**
   * Waits for auth state, then:
   * - Redirects to login.html if not authenticated or email not verified.
   * - Resolves with the current user if authenticated + verified.
   *
   * @param {string} [returnPath] - Current page path+search to return to after login.
   */
  function requireAuth(returnPath) {
    const loginUrl = 'login.html' +
      (returnPath ? '?next=' + encodeURIComponent(returnPath) : '');

    return new Promise(function (resolve) {
      firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {
          window.location.href = loginUrl;
          return;
        }
        resolve(user);
      });
    });
  }

  function getUser() {
    return firebase.auth().currentUser;
  }

  function signOut() {
    return firebase.auth().signOut().then(function () {
      window.location.href = 'login.html';
    });
  }

  return { requireAuth: requireAuth, getUser: getUser, signOut: signOut };
})();
