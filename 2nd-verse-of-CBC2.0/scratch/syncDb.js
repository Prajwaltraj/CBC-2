import fs from 'fs';
import Papa from 'papaparse';
import https from 'https';

const FIREBASE_DB_URL = 'https://cbc20-3af58-default-rtdb.firebaseio.com';

const files = ['scratch/sheet1.csv', 'scratch/sheet2.csv'];

function sanitizeKeys(obj) {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Replace dots, hash, dollar, brackets, slashes, and newlines
    const safeKey = key.replace(/[.#$\[\]\/\n\r]/g, ' ').trim();
    sanitized[safeKey] = value;
  }
  return sanitized;
}

async function uploadToFirebase(hash, data) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(data);
    const req = https.request(`${FIREBASE_DB_URL}/registeredTeams/${hash}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(`Firebase Error: ${res.statusCode} ${responseBody}`);
        }
      });
    });
    
    req.on('error', reject);
    req.write(dataString);
    req.end();
  });
}

async function sync() {
  let successCount = 0;
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const results = Papa.parse(text, { header: true, skipEmptyLines: true });
    
    for (const row of results.data) {
      const sanitizedRow = sanitizeKeys(row);
      const emails = [
        row['Email Address'],
        row['Email ID:'],
        row['Email'],
        row['email'],
        row['Team Member 2 Email ID:'],
        row['Team Member 3 Email ID:'],
        row['Team Members 4 Email ID:']
      ];
      
      let added = false;
      for (const e of emails) {
        if (e && typeof e === 'string' && e.includes('@')) {
          const emailHash = e.toLowerCase().trim().replace(/[.#$\[\]\/]/g, '_');
          await uploadToFirebase(emailHash, sanitizedRow);
          added = true;
          console.log(`Uploaded ${e} as ${emailHash}`);
        }
      }
      if (added) successCount++;
    }
  }
  console.log(`Successfully synced ${successCount} teams to Firebase.`);
}

sync().catch(console.error);
