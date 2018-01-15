export function ok_response(obj) {
	return {
		statusCode: 200,
		body: JSON.stringify(obj)
	};
}