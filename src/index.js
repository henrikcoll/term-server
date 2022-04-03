const express = require('express');
const app = express();
const axios = require('axios');
const Docker = require('dockerode');
const docker = new Docker();

const termDomain = process.env.TERM_DOMAIN ?? 'localhost';
const termBaseUrl = process.env.TERM_BASE_URL ?? 'http://localhost:3001';

async function getHostId() {
	let { data } = await axios.get(process.env.NAME_URL ?? 'https://name-generator.exo.heka.no/project');
	console.log(data);
	return data;
}

app.get('/', async (req, res) => {
	try {

		// TODO: Create new term-host
		let hostId = await getHostId();

		let termUrl = `${termBaseUrl}/${hostId}`;

		const container = await docker.createContainer({
			Image: process.env.TERM_DOCKER_IMAGE ?? 'term-host',
			AttachStdin: false,
			AttachStdout: false,
			AttachStderr: false,
			Tty: false,
			OpenStdin: false,
			StdinOnce: false,
			name: `term-host-${hostId}`,
			Hostname: hostId,
			Labels: {
				'traefik.enable': 'true',
				[`traefik.http.routers.${hostId}.entrypoints`]: process.env.TRAEFIK_ENTRYPOINT ?? 'web',
				[`traefik.http.routers.${hostId}.rule`]: `Host(\`${termDomain}\`) && PathPrefix(\`/${hostId}\`)`
			},
			NetworkMode: process.env.TRAEFIK_NETWORK ?? 'traefik'
		});

		await container.start();

		// Wait to ensure the container is started
		setTimeout(() => {
			res.redirect(termUrl);
		}, 2500);
	} catch (e) {
		console.error(e);
	}
});

app.listen(3000);