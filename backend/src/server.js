require('dns').setServers(['8.8.8.8']);
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

async function startServer() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32 || jwtSecret.includes('replace_with')) {
    throw new Error('Set JWT_SECRET to a random value of at least 32 characters in backend/.env.');
  }
  if (!process.env.CLIENT_URL) process.env.CLIENT_URL = 'http://localhost:5173';

  await connectDB();
  const port = Number(process.env.PORT) || 5000;
  return app.listen(port, () => console.log(`[Server] API listening on port ${port}`));
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`[Startup Error] ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
