function generate(cfn, extra) {
	cfn.Resources.userPool = {
		Type: 'Custom::UserPoolCustomResource',
		Properties: {
			ServiceToken: {
				'Fn::Join' : [
					':',
					[ 
						'arn:aws:lambda', 
						{Ref: 'AWS::Region' }, 
						{Ref: 'AWS::AccountId' }, 
						'function', 
						{Ref: 'userPoolCustomResourceHandler'}
					]
				]
			},
			PoolName: {
				'Fn::Join' : [
					' ',
					[ 
						{ Ref: 'AWS::StackName' },
						'UserPool',
					] 
				]
			},
			AutoVerifiedAttributes: ['email'],
			Policies: {
				PasswordPolicy: {
					MinimumLength: 8,
					RequireLowercase: false,
					RequireNumbers: false,
					RequireSymbols: false,
					RequireUppercase: false
				}
			},
			MfaConfiguration: 'OFF',
			UsernameAttributes: ['email'],
			Schema: [
				{
					AttributeDataType : 'String',
					DeveloperOnlyAttribute : false,
					Mutable : true,
					Name : 'given_name',
					Required : false
				},
				{
					AttributeDataType : 'String',
					DeveloperOnlyAttribute : false,
					Mutable : true,
					Name : 'family_name',
					Required : false
				}
			]
		}
	};

	cfn.Resources.userPoolClient = {
		Type: 'AWS::Cognito::UserPoolClient',
		Properties: {
			GenerateSecret: false,
			UserPoolId: {
				Ref: 'userPool'
			}
		}
	};

	cfn.Resources.identityPool = {
		Type: 'AWS::Cognito::IdentityPool',
		Properties: {
			AllowUnauthenticatedIdentities: true,
			CognitoIdentityProviders: [
				{
					ClientId: {
						Ref: 'userPoolClient'
					},
					ProviderName: {
						'Fn::GetAtt': ['userPool', 'ProviderName']
					}
				}
			]
		}
	};

	cfn.Resources.identityPoolRoleMapping = {
		Type: 'AWS::Cognito::IdentityPoolRoleAttachment',
		Properties: {
			IdentityPoolId: {
				Ref: 'identityPool'
			},
			Roles: {
				authenticated: { 'Fn::GetAtt': ['cognitoAuthorizedRole', 'Arn'] },
				unauthenticated: { 'Fn::GetAtt': ['cognitoUnAuthorizedRole', 'Arn'] }
			}
		}
	};

	cfn.Resources.cognitoUnAuthorizedRole = {
		Type: 'AWS::IAM::Role',
		Properties: {
			AssumeRolePolicyDocument: {
				Version: '2012-10-17',
				Statement: [
					{
						Effect: 'Allow',
						Principal: { Federated: 'cognito-identity.amazonaws.com' },
						Action: ['sts:AssumeRoleWithWebIdentity'],
						Condition: {
							StringEquals: {
								'cognito-identity.amazonaws.com:aud': { Ref: 'identityPool' }
							},
							'ForAnyValue:StringLike': {
								'cognito-identity.amazonaws.com:amr': 'unauthenticated'
							} 
						}
					}
				]
			},
			Policies: []
		}
	};

	cfn.Resources.cognitoAuthorizedRole = {
		Type: 'AWS::IAM::Role',
		Properties: {
			AssumeRolePolicyDocument: {
				Version: '2012-10-17',
				Statement: [
					{
						Effect: 'Allow',
						Principal: { Federated: 'cognito-identity.amazonaws.com' },
						Action: ['sts:AssumeRoleWithWebIdentity'],
						Condition: {
							StringEquals: {
								'cognito-identity.amazonaws.com:aud': { Ref: 'identityPool' }
							},
							'ForAnyValue:StringLike': {
								'cognito-identity.amazonaws.com:amr': 'authenticated'
							} 
						}
					}
				]
			},
			Policies: [
			]
		}
	};

	cfn.Resources.userPoolCustomResourceRole = {
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
			Policies: [
				{
					PolicyName: 'UserPoolPolicy',
					PolicyDocument: {
						Version: '2012-10-17',
						Statement: [
							{
								Effect: 'Allow',
								Action: [
									'cognito-idp:*',
									'cognito:*',
									'iam:PassRole'
								],
								Resource: '*'
							}
						]
					}
				}
			],
			ManagedPolicyArns: [
				'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
			]
		}
	};

	cfn.Outputs.userPoolClientId = {
		Value: { Ref: 'userPoolClient' }
	};

	cfn.Outputs.userPoolId = {
		Value: { Ref: 'userPool' }
	};

	cfn.Outputs.userPoolArn = {
		Value: {
			'Fn::GetAtt': ['userPool', 'Arn']
		}
	};

	cfn.Outputs.identityPoolId = {
		Value: { Ref: 'identityPool' }
	};

	return cfn;
}

module.exports = {
	generate
};