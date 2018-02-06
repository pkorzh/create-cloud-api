const path = require('path');

const paths = require('../../../config/paths');
const app = require('../app');
const getAllLambda = require('../lambda').all;

function generate(cfn, extra) {
	const lambdas = {};

	_map(extra.api).forEach(lambda => {
		Object.assign(cfn.Resources, attachFunction(lambda));

		if (lambda.restHandler) {
			Object.assign(cfn.Resources, attachInvokePermission(lambda));
		}
	});

	return cfn;
}

function _map(api) {
	const arr = [];

	getAllLambda().forEach(lambda => {
		let restHandler = false;

		for (let _path in api.paths) {
			for (let method in api.paths[_path]) {

				const { 
					operationId, 
					description 
				} = api.paths[_path][method];

				const [
					lambdaName,
					handler
				] = operationId.split('-');

				if (lambdaName === lambda.name) {
					arr.push(Object.assign({}, lambda, {
						description: description || lambda.description,
						handler,
						restHandler: true
					}));

					restHandler = true;
				}
			}
		}

		if (!restHandler) {
			arr.push(Object.assign({}, lambda, {
				handler: 'handler',
			}));
		}
	});

	return arr.map(lambda => {
		lambda.logicalName = lambda.name + lambda.handler.charAt(0).toUpperCase() + lambda.handler.slice(1);
		return lambda
	});
}

function attachInvokePermission(lambda) {
	return {
		[`${lambda.logicalName}Permission`]: {
			Type: 'AWS::Lambda::Permission',
			Properties: {
				FunctionName: { 'Fn::GetAtt': [lambda.logicalName, 'Arn'] },
				Action: 'lambda:InvokeFunction',
				Principal: 'apigateway.amazonaws.com',
				SourceArn: {
					'Fn::Join': [
						'', 
						[
							'arn:aws:execute-api:', 
							{Ref: 'AWS::Region'}, 
							':', 
							{Ref: 'AWS::AccountId'}, 
							':', 
							{Ref: 'api'}, 
							'/*'
						]
					]
				}
			}
		}
	};
}

function attachFunction(lambda, defaultRole = 'lambdaRestApiRole') {
	const properties = Object.assign({
		Runtime: 'nodejs6.10',
		Handler: `index.${lambda.handler}`,
		Role: { 'Fn::GetAtt': [lambda.role || defaultRole, 'Arn'] },
		Code: {
			S3Bucket: app.uploadsBucket,
			S3Key: `${app.uploadsBucketKeyPrefix}/${lambda.zip}`
		},
		Timeout: lambda.timeout || 3,
		Description: lambda.Description
	}, resources[lambda.logicalName] ? (resources[lambda.logicalName].Properties || {}) : {});

	return {
		[lambda.logicalName]: {
			Type: 'AWS::Lambda::Function',
			Properties: properties
		}
	};
}

module.exports = {
	generate
};