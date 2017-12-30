module.exports = {
	AWSTemplateFormatVersion: '2010-09-09',
	Description: 'Create Cloud API Stack',
	Parameters: {},
	Conditions: {},
	Resources: {
		lambdaRestApiRole: {
			Type: 'AWS::IAM::Role',
			Properties: {
				AssumeRolePolicyDocument: {
					Version: '2012-10-17',
					Statement: [
						{
							Effect: 'Allow',
							Principal: { Service: ['lambda.amazonaws.com'] },
							Action: ['sts:AssumeRole']
						}
					]
				},
				ManagedPolicyArns: [
					'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
				]
			}
		}
	},
	Outputs: {}
};