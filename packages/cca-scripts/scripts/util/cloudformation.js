const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs-extra');

const paths = require('../../config/paths');
const app = require('./app');

AWS.config.update({
	region: app.region
});

const cf = new AWS.CloudFormation();

function createStack() {
	return new Promise((resolve, reject) => {
		const params = {
			StackName: app.name,
			TemplateBody: fs.readFileSync(path.join(paths.appBuildPath, 'cloudformation.json')).toString(),
			Capabilities: ['CAPABILITY_IAM'],
			Parameters: []
		};

		cf.createStack(params, (err) => {
			if (err) {
				if (err.toString().indexOf('already exists')>=0) {
					resolve(updateStack(params));
				} else {
					reject(err);
				}
			} else {
				resolve(pollStack(params));
			}
		});
	});
}

function updateStack(params) {
	return new Promise((resolve, reject) => {
		cf.updateStack(params, (err) => {
			if (err) {
				if (err.toString().indexOf('No updates are to be performed')>=0) {
					resolve(pollStack(params));
				} else {
					reject(err);
				}
			} else {
				resolve(pollStack(params));
			}
		});
	});
}

function deleteStack() {
	return new Promise((resolve, reject) => {
		const params = {
			StackName: app.name
		};

		cf.deleteStack(params, (err) => {
			if (err) {
				reject(err);
			} else {
				pollStack(params).catch((err) => {
					if (err.message.indexOf('does not exist')) {
						resolve();
					} else {
						reject(err);
					}
				});
			}
		});
	});
}

function pollStack(params) {
	return new Promise((resolve, reject) => {
		cf.describeStacks({StackName : params.StackName}, (err, data) => {
			if (err) {
				reject(err);
				return;
			}

			const stack = data.Stacks[0];
			
			switch (stack.StackStatus) {
				case 'CREATE_COMPLETE':
				case 'UPDATE_COMPLETE':
					console.log('Stack operation completed');
					resolve();
					return;
				case 'ROLLBACK_COMPLETE':
				case 'CREATE_FAILED':
				case 'UPDATE_FAILED':
				case 'DELETE_FAILED':
				case 'UPDATE_ROLLBACK_COMPLETE':
					reject(new Error('Stack mutation failed'));
					return;
			}
			
			console.log('Waiting for stack mutation. This may take some time - ' + stack.StackStatus);

			setTimeout(function() {
				resolve(pollStack(params));
			}, 5000);
		});
	});
}

module.exports = {
	pollStack,
	createStack,
	deleteStack,
};