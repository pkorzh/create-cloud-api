const https = require('https');
const url = require('url');

const STATUSES = {
	ok: 'SUCCESS',
	notOk: 'FAILED'
};

function ok(event, {PhysicalResourceId, Data}) {
	event.PhysicalResourceId = PhysicalResourceId;
	return sendResponse(event, STATUSES.ok, Data, null);
}

function notOk(event, err) {
	return sendResponse(event, STATUSES.notOk, null, err);
}

function sendResponse(event, status, data, err) {

	const responseBody = {
		StackId: event.StackId,
		RequestId: event.RequestId,
		LogicalResourceId: event.LogicalResourceId,
		PhysicalResourceId: event.PhysicalResourceId,
		Status: status,
		Data: data
	};

	if (status == STATUSES.notOk) {
		responseBody.Reason = err ? err.message : (err + '');
	}

	const json = JSON.stringify(responseBody);

	const parsedUrl = url.parse(event.ResponseURL);

	const options = {
		hostname: parsedUrl.hostname,
		port: 443,
		path: parsedUrl.path,
		method: 'PUT',
		headers: {
			'content-type': '',
			'content-length': json.length
		}
	};

	return new Promise((resolve, reject) => {
		var request = https.request(options, function(response) {
			resolve(data);
		});

		request.on('error', function(error) {
			console.log(error);
			reject(error);
		});

		request.write(json);
		request.end();
	});
}

exports.ok = ok;
exports.notOk = notOk;