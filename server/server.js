require('dotenv').config();

const { createServer } = require('http');
const app = require('./src/app');
const { initSocket } = require('./config/socket');
const connectedTodb = require('./config/db');

const PORT = process.env.PORT || 5000; //  fallback so server never starts on undefined

const httpServer = createServer(app);
initSocket(httpServer);

// Wait for DB before accepting connections
connectedTodb()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' Failed to connect to DB:', err);
    process.exit(1);
  });