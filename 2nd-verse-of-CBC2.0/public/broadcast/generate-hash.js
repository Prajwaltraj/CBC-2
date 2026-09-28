const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log(`\nPassword: ${password}`);
  console.log(`Hash for .env:\n${hash}\n`);
});