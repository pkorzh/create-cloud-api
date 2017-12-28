const util = require('./util');

util.cloudformation.getStackOutputs().then(outputs => {
	let config = {
		baseUrl: outputs.apiUrl,
		apiKey: outputs.apiKey
	};

	console.log(JSON.stringify(config, null, 2));
});