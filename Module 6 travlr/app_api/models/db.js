const mongoose = require('mongoose');
const host = process.env.DB_HOST || '127.0.0.1';
const dbURI = process.env.MONGODB_URI || `mongodb://${host}/travlr`;

mongoose.connection.on('connected', () => console.log('Mongoose connected'));
mongoose.connection.on('error', error => console.error('Mongoose connection error:', error.message));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));

// Export the connection promise so callers wait for success before doing work.
// Handle its rejection even when this module is loaded only for its side effects.
mongoose.ready = mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 });
mongoose.ready.catch(() => {});
require('./travlr');

let closing = false;
async function shutdown(signal) {
  if (closing) return;
  closing = true;
  try {
    await mongoose.connection.close();
    console.log(`Mongoose closed for ${signal}`);
    if (signal === 'SIGUSR2') process.kill(process.pid, signal);
    else process.exit(0);
  } catch (error) {
    console.error('Database shutdown failed:', error.message);
    process.exit(1);
  }
}
for (const signal of ['SIGINT', 'SIGTERM', 'SIGUSR2']) {
  process.once(signal, () => shutdown(signal));
}

module.exports = mongoose;
