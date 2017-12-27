const inquirer = require('inquirer');

const util = require('./util');

inquirer.prompt({
	type: 'confirm',
	name: 'delete',
	message: 'Are you sure you want to delete the API?'
}).then(answer => {
	if (answer.delete) {
		util.cloudformation.deleteStack();
	}
});