import db from './db.js';

console.log('Checking DB Import...');
// The logging is inside db.js so just importing it triggers the log.
setTimeout(() => process.exit(0), 1000);
