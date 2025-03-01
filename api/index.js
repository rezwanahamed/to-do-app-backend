const { createServer } = require('@vercel/node');
const server = require('../bin/www'); // Import your Express server

// Export the serverless handler
module.exports = createServer(server);