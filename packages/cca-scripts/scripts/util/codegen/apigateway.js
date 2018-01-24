function generate(cfn, extra) {
	const api = extra.api;

	for (let path in api.paths) {
		for (let method in api.paths[path]) {
			process(api.paths[path][method]);
		}

		processPath(api.paths[path]);
	}

	cfn.Resources.api = {
		Type: 'AWS::ApiGateway::RestApi',
		Properties: {
			FailOnWarnings: true,
			Body: extra.api
		}
	};

	cfn.Resources.apiAccount = {
		Type: 'AWS::ApiGateway::Account',
		Properties: {
			CloudWatchRoleArn: { 'Fn::GetAtt': ['apiCloudWatchLogsRole', 'Arn'] }
		}
	};

	cfn.Resources.apiDeployment = {
		Type: 'AWS::ApiGateway::Deployment',
		Properties: {
			RestApiId: {'Ref': 'api'},
			StageName: 'DummyStage'
		}
	};

	cfn.Resources.apiStage = {
		Type: 'AWS::ApiGateway::Stage',
		Properties: {
			StageName: 'dev',
			RestApiId: {'Ref': 'api'},
			DeploymentId: {'Ref': 'apiDeployment'}
		}
	};

	cfn.Resources.apiCloudWatchLogsRole = {
		Type: 'AWS::IAM::Role',
		Properties: {
			AssumeRolePolicyDocument: {
				Version: '2012-10-17',
				Statement: [
					{
						Effect: 'Allow',
						Principal: {  Service: ['apigateway.amazonaws.com'] },
						Action: ['sts:AssumeRole']
					}
				]
			},
			ManagedPolicyArns: [
				'arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs'
			]
		}
	};

	cfn.Outputs.apiId = {
		Value: { Ref: 'api' }
	};

	cfn.Outputs.apiUrl = {
		Value: {
			'Fn::Join': [
				'', 
				[
					'https://', 
					{'Ref': 'api'}, 
					'.execute-api.', 
					{'Ref': 'AWS::Region'}, 
					'.amazonaws.com',
					'/',
					{'Ref': 'apiStage'}
				]
			]
		}
	};

	return cfn;
}

function process(definition) {
	const [
		name,
		handler
	] = definition.operationId.split('-');

	const logicalName = name + handler.charAt(0).toUpperCase() + handler.slice(1);

	definition['x-amazon-apigateway-integration'] = {
		type: 'aws_proxy',
		uri: {'Fn::Join': ['',
			['arn:aws:apigateway:', {'Ref': 'AWS::Region'}, ':lambda:path/2015-03-31/functions/', {'Fn::GetAtt': [logicalName, 'Arn']}, '/invocations']
		]},
		passthroughBehavior: 'when_no_match',
		httpMethod: 'POST'
	};
}

function processPath(definition) {
	const methods = `'OPTIONS,${Object.keys(definition).join(',').toUpperCase()}'`;

	definition.options = {
		consumes: ['application/json'],
		produces: ['application/json'],
		parameters: definition.get.parameters,
		responses: {
			200: {
				description: '200 response',
				headers: {
					'Access-Control-Allow-Origin': {
						type: 'string'
					},
					'Access-Control-Allow-Methods': {
						type: 'string'
					},
					'Access-Control-Allow-Headers': {
						type: 'string'
					},
        		}
			}
		},
		'x-amazon-apigateway-integration': {
			passthroughBehavior: 'when_no_match',
			requestTemplates: {
				'application/json': '{"statusCode": 200}'
			},
			responses: {
				default: {
					statusCode: 200,
					responseParameters: {
						'method.response.header.Access-Control-Allow-Methods': methods,
						'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
						'method.response.header.Access-Control-Allow-Origin': "'*'"
					}
				}
			},
			type: 'mock'
		}
	};
}

module.exports = {
	generate
};