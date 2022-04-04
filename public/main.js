const socket = io();

socket.on('redirect', ({ to }) => {
	window.location = to;
});