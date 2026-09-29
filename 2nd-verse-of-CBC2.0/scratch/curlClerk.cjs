const fetch = require('node-fetch');

(async () => {
  // We don't have the frontend FAPI token, so we can't perfectly simulate signIn.create
  // But we can just fallback to signUp.create on ANY signIn error.
})();
