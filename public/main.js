const socket = io();

socket.on('redirect', ({ to }) => {
	console.log('redirect', { to });
	setInterval(async () => {
		let response = await fetch(`${to}/status`);

		if (response.status === 200) {
			window.location = to;
		}
	}, 250);
});