import { ok_response } from '../../src/response';

export function handler(event, context, callback) {
	callback(null, ok_response({
		message: 'Greetings from API',
	}));
};