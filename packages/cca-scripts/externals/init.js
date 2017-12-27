const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const chalk = require('chalk');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({ signatureVersion: 'v4' });

module.exports = function init(appPath, appName, originalDirectory) {
	const ownPackageName = require(path.join(__dirname, '..', 'package.json')).name;
	const ownPath = path.join(appPath, 'node_modules', ownPackageName);

	const appPackage = require(path.join(appPath, 'package.json'));

	appPackage.scripts = {
		deploy: `${ownPackageName} deploy`,
		destroy: `${ownPackageName} destroy`,
		eject: `${ownPackageName} eject`,
		'get-client-config': `${ownPackageName} get-client-config`,
	};

	fs.writeFileSync(
		path.join(appPath, 'package.json'),
		JSON.stringify(appPackage, null, 2)
	);

	const readmeExists = fs.existsSync(path.join(appPath, 'README.md'));

	if (readmeExists) {
		fs.renameSync(
			path.join(appPath, 'README.md'),
			path.join(appPath, 'README.old.md')
		);
	}

	const templatePath = path.join(ownPath, 'template');

	if (fs.existsSync(templatePath)) {
		fs.copySync(templatePath, appPath);
	}

	inquirer.prompt([{
		type: 'list',
		name: 'region',
		message: 'AWS Region',
		choices: [
			{value: 'us-east-1', name: 'US East (N. Virginia)'},
			{value: 'us-east-2', name: 'US East (Ohio)'},
			{value: 'us-west-1', name: 'US West (N. California)'},
			{value: 'us-west-2', name: 'US West (Oregon)'},
			{value: 'ca-central-1', name: 'Canada (Central)'},
			{value: 'eu-central-1', name: 'EU (Frankfurt)'},
			{value: 'eu-west-1', name: 'EU (Ireland)'},
			{value: 'eu-west-2', name: 'EU (London)'},
			{value: 'eu-west-3', name: 'EU (Paris)'},
			{value: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)'},
			{value: 'ap-northeast-2', name: 'Asia Pacific (Seoul)'},
			{value: 'ap-southeast-1', name: 'Asia Pacific (Singapore)'},
			{value: 'ap-southeast-2', name: 'Asia Pacific (Sydney)'},
			{value: 'ap-south-1', name: 'Asia Pacific (Mumbai)'},
			{value: 'sa-east-1', name: 'South America (São Paulo)'}
		]
	}, {
		type: 'input',
		name: 'bucketName',
		message: 'Lambda bucket name. We will use it to upload lambda code.',
		validate: function _validate(bucketName) {
			const done = this.async();

			s3.headBucket({Bucket: bucketName}, function(err, data) {
				if (err) {
					done('Bucket doesn\'t exists or you don\'t have permission to access it');
				} else {
					done(null, true);
				}
			});
		}
	}]).then(answer => {
		const appJson = {
			region: answer.region,
			uploadsBucket: answer.bucketName,
			uploadsBucketKeyPrefix: ''
		};

		fs.writeFileSync(
			path.join(appPath, 'app.json'),
			JSON.stringify(appJson, null, 2)
		);
	}).then(() => {
		console.log();
		console.log(`Success! Created ${appName} at ${appPath}`);
		console.log('Inside that directory, you can run several commands:');

		console.log();
		console.log(chalk.cyan(`npm run deploy`));
		console.log('\tCreates AWS API Gateway');
		console.log();

		console.log();
		console.log(chalk.cyan(`npm run destroy`));
		console.log('\tDestroys AWS API Gateway');
		console.log();

		console.log(`Edit ${chalk.cyan(`app.json`)} to change bucket/region settings`);
		console.log();

		if (readmeExists) {
			console.log();
			console.log(chalk.yellow('You had a `README.md` file, we renamed it to `README.old.md`'));
		}
	});
}