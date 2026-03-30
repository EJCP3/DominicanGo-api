const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  const connectionString = process.env.DATABASE_URL;
  console.log('Using DB URL:', connectionString);
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to DB.');
    
    // Check users
    const res = await client.query('SELECT id, email, role FROM users WHERE email = $1', ['euddy.ejcp@gmail.com']);
    console.log('Users found:', res.rows);
    
    if (res.rows.length > 0) {
      console.log('Updating user to ADMIN...');
      await client.query('UPDATE users SET role = $1 WHERE email = $2', ['ADMIN', 'euddy.ejcp@gmail.com']);
      console.log('Update successful.');
      
      const res2 = await client.query('SELECT id, email, role FROM users WHERE email = $1', ['euddy.ejcp@gmail.com']);
      console.log('Verification:', res2.rows);
    } else {
      console.log('User not found in DB.');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
