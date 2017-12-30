const AWS = require('aws-sdk');

const userpool = require('./userpool');
const response = require('./response');

function getEnvironment(context) {
	var parsedArn = context.invokedFunctionArn.match(/^arn:aws:lambda:(\w+-\w+-\d+):(\d+):function:(.*)$/);
	return {
		LambdaArn: parsedArn[0],
		Region: parsedArn[1],
		AccountId: parsedArn[2],
		LambdaName: parsedArn[3]
	};
}

exports.handler = (event, context, callback) => {
	const env = getEnvironment(context);
	console.log(event);
	const processRequest = (event) => {
		const {RequestType, ResourceProperties} = event;

		delete ResourceProperties['ServiceToken'];

		if (RequestType == 'Delete') {
			const {PhysicalResourceId} = event;
			return userpool.Delete(PhysicalResourceId, env);
		} else if (RequestType == 'Update') {
			const {OldResourceProperties, PhysicalResourceId} = event;
			return userpool.Update(PhysicalResourceId, ResourceProperties, OldResourceProperties, env);
		} else if (RequestType == 'Create') {
			return userpool.Create(ResourceProperties, env);
		}
	};

	const promise = processRequest(event).then(payload => {
		return response.ok(event, payload);
	}).catch(err => {
		console.log(err);
		return response.notOk(event, err);
	});

	promise.then(data => callback(null, data)).catch(err => callback(err))
};