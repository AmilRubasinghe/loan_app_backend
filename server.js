require('dotenv').config();
const http = require('http');
const app = require('./index');
// const port = 8022;

const server = http.createServer(app);

server.listen(process.env.port);
