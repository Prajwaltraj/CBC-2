const fs = require('fs');
const dts = fs.readFileSync('node_modules/@clerk/shared/dist/types/signUp.d.ts', 'utf8');
console.log(dts.split('\n').filter(line => line.includes('verifyEmailCode') || line.includes('attemptVerification')).join('\n'));
