import * as net from 'net';

const host = process.env.DB_HOST || 'db';
const port = parseInt(process.env.DB_PORT || '5432', 10);

function checkConnection() {
  const socket = net.createConnection(port, host);

  socket.on('connect', () => {
    console.log(`Database at ${host}:${port} is reachable!`);
    socket.end();
    process.exit(0);
  });

  socket.on('error', (err) => {
    console.log(`Waiting for database at ${host}:${port}... (${err.message})`);
    setTimeout(checkConnection, 1000);
  });
}

checkConnection();
