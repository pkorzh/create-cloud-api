const chalk = require('chalk');

const util = require('./util');

util.apigateway.exportApi().then(doc => {
	console.log(doc);
	console.log(chalk.green('Successfully exported Swagger definition from AWS'));
});