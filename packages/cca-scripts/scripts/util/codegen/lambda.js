const path = require('path');
const paths = require('../../../config/paths');

const app = require('../app');

function generate(cfn, extra) {

	collectLambdas(extra.api).forEach(lambda => {
		Object.assign(cfn.Resources, attachFunction(lambda));
		Object.assign(cfn.Resources, attachInvokePermission(lambda));
	});

	return cfn;
}

function collectLambdas(api) {
	const arr = [];

	for (let _path in api.paths) {
		for (let method in api.paths[_path]) {

			const definition = api.paths[_path][method];
			const operationId = definition.operationId;
			const [lambdaName, handler] = operationId.split('-');

			const { version, keywords } = require(
				path.join(paths.appLambdaPath, lambdaName, 'package.json')
			);

			arr.push({
				name: lambdaName,
				zip: `${lambdaName}-${version}.zip`,
				description: definition.description || lambdaPackageJson.description,
				version,
				keywords,
				handler,
			});
		}
	}

	return arr;
}

function attachInvokePermission(lambda) {
	return {
		[`${lambda.name}Permission`]: {
			Type: 'AWS::Lambda::Permission',
			Properties: {
				FunctionName: { 'Fn::GetAtt': [lambda.name, 'Arn'] },
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

function attachFunction(lambda) {
	return {
		[lambda.name]: {
			Type: 'AWS::Lambda::Function',
			Properties: {
				Runtime: 'nodejs6.10',
				Handler: 'index.handler',
				Role: { 'Fn::GetAtt': ['lambdaExecutionRole', 'Arn'] },
				Code: {
					S3Bucket: app.uploadsBucket,
					S3Key: `${app.uploadsBucketKeyPrefix}/${lambda.zip}`
				},
				Environment: {
					Variables: {}
				},
				Description: lambda.Description
			}
		}
	};
}

module.exports = {
	generate,
	collectLambdas
};