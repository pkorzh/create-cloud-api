const util = require('./scripts/util');

module.exports = {
	collectLambdas() {
		return util.lambda.all();
	}
};