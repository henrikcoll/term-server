const termDomain = process.env.TERM_DOMAIN ?? 'localhost';
const termBaseUrl = process.env.TERM_BASE_URL ?? 'http://localhost:3001';

module.exports = {
	termDomain,
	termBaseUrl
};