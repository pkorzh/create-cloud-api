const util = require('./util');

util.cloudformation.getStackOutputs().then(outputs => {
	let config = {
		baseUrl: outputs.apiUrl,
		apiKey: outputs.apiKey,
		userPoolClientId: outputs.userPoolClientId,
		userPoolId: outputs.userPoolId,
		identityPoolId: outputs.identityPoolId,
		region: util.app.region
	};

	console.log(JSON.stringify(config, null, 2));
});