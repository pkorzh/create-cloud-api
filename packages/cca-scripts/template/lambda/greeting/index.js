module.exports.handler = (event, context, callback) => {
	const response = {
		statusCode: 200,
		body: JSON.stringify({
			message: 'Greetings from API',
		})
	};

	callback(null, response);
};