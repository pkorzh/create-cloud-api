const util = require('./util');

util.cloudformation.getStackOutputs().then(outputs => {
	const config = {
		baseUrl: outputs.ApiUrl
	};

	console.log(JSON.stringify(config, null, 2));
});