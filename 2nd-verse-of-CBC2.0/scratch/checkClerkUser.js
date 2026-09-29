const fetch = require('node-fetch');

(async () => {
  const res = await fetch('https://api.clerk.com/v1/users?email_address=cc1340975@gmail.com', {
    headers: {
      'Authorization': 'Bearer sk_test_ccOknSMCEV7dRrrBVvrKT2qZCCEKyqbG8sRYERPlav'
    }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
})();
