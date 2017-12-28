function generate(cfn, extra) {
	if (shouldAttachXApiKey(extra.api)) {
		cfn.Resources.apiKey = {
			Type: 'AWS::ApiGateway::ApiKey',
			DependsOn: ['apiStage', 'apiDeployment'],
			Properties: {
				StageKeys: [
					{
						RestApiId: {'Ref': 'api'},
						StageName: 'dev'
					}
				],
				Enabled: true
			}
		};

		cfn.Resources.usagePlan = {
			Type: 'AWS::ApiGateway::UsagePlan',
			Properties: {
				ApiStages: [
					{
						ApiId: {'Ref': 'api'},
						Stage: {'Ref': 'apiStage'}
					}
				]
			}
		};

		cfn.Resources.apiKeyUsagePlanKey = {
			Type: 'AWS::ApiGateway::UsagePlanKey',
			Properties: {
				KeyId: {'Ref': 'apiKey'},
				KeyType: 'API_KEY',
				UsagePlanId: {'Ref': 'usagePlan'}
			}
		};

		cfn.Outputs.apiKeyId = {
			Value: { Ref: 'apiKey' }
		};
	}

	return cfn;
}

function shouldAttachXApiKey(api) {
	if (api.swagger === '2.0') {
		const securityDefinitions = api.securityDefinitions || {};

		for(let key in securityDefinitions) {
			const securityDefinition = securityDefinitions[key];

			if (securityDefinition.type === 'apiKey' && 
				securityDefinition.name === 'x-api-key') {
				return true;
			}
		}
	}
}

module.exports = {
	generate
};