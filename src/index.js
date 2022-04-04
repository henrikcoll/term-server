const express = require('express');
const { createServer } = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { termBaseUrl } = require('./config');
const { createContainer } = require('./container');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use('/public', express.static(path.join(__dirname, '../public')));

app.get('/', async (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

io.on('connection', async socket => {
	const hostId = await createContainer();
	let termUrl = `${termBaseUrl}/${hostId}`;

	socket.emit('redirect', { to: termUrl });
});

server.listen(3000, '0.0.0.0');