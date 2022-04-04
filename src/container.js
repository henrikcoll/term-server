const axios = require('axios');
const Docker = require('dockerode');
const { termBaseUrl, termDomain } = require('./config');

const docker = new Docker();

async function getHostId() {
	let { data } = await axios.get(process.env.NAME_URL ?? 'https://name-generator.exo.heka.no/project');
	console.log(data);
	return data;
}

async function createContainer() {
	try {

		// TODO: Create new term-host
		let hostId = await getHostId();

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
			Env: [
				`TERM_HOST_ID=${hostId}`
			],
			Labels: {
				'traefik.enable': 'true',
				[`traefik.http.routers.${hostId}.entrypoints`]: process.env.TRAEFIK_ENTRYPOINT ?? 'web',
				[`traefik.http.routers.${hostId}.rule`]: `Host(\`${termDomain}\`) && PathPrefix(\`/${hostId}\`)`
			},
			NetworkMode: process.env.TRAEFIK_NETWORK ?? 'traefik'
		});

		await container.start();

		// Wait to ensure the container is started
		await new Promise(resolve => setTimeout(() => resolve(), parseInt(process.env.TERM_STARTUP_DELAY) ?? 1000));

		return hostId;
	} catch (e) {
		console.error(e);
		return null;
	}
}

module.exports = {
	createContainer
};