const fs = require('fs-extra');
const path = require('path');
const AWS = require('aws-sdk');

const paths = require('../config/paths');
const util = require('./util');

const api = util.getapi.getapi();
const s3 = new AWS.S3({ signatureVersion: 'v4' });

fs.ensureDirSync(paths.appBuildPath);

function pack() {
	return Promise.all(util.codegen.lambda.collectLambdas(api).map(util.archiver.archive));
}

function generateTemplate() {
	const emptyCfn = require(path.join(paths.appPath, 'template'));

	const reducers = [
		util.codegen.lambda.generate,
		util.codegen.apigateway.generate
	];

	const cfn = reducers.reduce((cfn, reducer) => {
		return reducer(cfn, {api});
	}, emptyCfn);

	return Promise.resolve(cfn);
}

function outputGeneratedTemplate(cfn) {
	fs.writeFileSync(
		path.join(paths.appBuildPath, 'cloudformation.json'),
		JSON.stringify(cfn, null, 2),
		'utf-8'
	);
}

function upload() {
	return Promise.all(fs.readdirSync(paths.appBuildPath)
		.map(file => path.join(paths.appBuildPath, file))
		.filter(file => fs.lstatSync(file).isFile())
		.map(file => {
			const content = fs.readFileSync(file);

			return new Promise((resolve, reject) => {
				let config = {
					Bucket: util.app.uploadsBucket,
					Key: `${util.app.uploadsBucketKeyPrefix}/${path.basename(file)}`,				
				};

				s3.putObject(Object.assign(config, {Body: content}), (err) => {
					err ? reject(err) : resolve();
				});
			});
		}));
}

pack()
	.then(generateTemplate)
	.then(outputGeneratedTemplate)
	.then(upload)
	.then(util.cloudformation.createStack);
