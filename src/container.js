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

		await docker.pull(process.env.TERM_DOCKER_IMAGE ?? 'term-host');

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

		return hostId;
	} catch (e) {
		console.error(e);
		return null;
	}
}

module.exports = {
	createContainer
};