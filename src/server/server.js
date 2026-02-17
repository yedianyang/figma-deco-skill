require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createRouter } = require('./routes');

function startServer(orchestrate) {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());
  app.use(createRouter(orchestrate));

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`[server] Listening on http://localhost:${port}`);
      resolve(server);
    });
  });
}

module.exports = { startServer };
