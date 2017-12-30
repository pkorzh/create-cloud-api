var AWS = require('aws-sdk');

var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: '2016-04-18'
});

function arn(id, region, accountId) {
    return [
        "arn:aws:cognito-idp:",
        region,
        ":",
        accountId,
        ":userpool/",
        id
    ].join('');
}

var toBoolean = function(obj, prop) {
    if (obj[prop] != undefined) obj[prop] = obj[prop] == "true";
}
var toInteger = function(obj, prop) {
    if (obj[prop] != undefined) obj[prop] = parseInt(obj[prop]);
}

var resolveParamsType = function(params) {
    if (params.DeviceConfiguration) {
        toBoolean(params.DeviceConfiguration, "ChallengeRequiredOnNewDevice");
        toBoolean(params.DeviceConfiguration, "DeviceOnlyRememberedOnUserPrompt");
    }

    if (params.Policies && params.Policies.PasswordPolicy) {
        toInteger(params.Policies.PasswordPolicy, "MinimumLength");
        toBoolean(params.Policies.PasswordPolicy, "RequireLowercase");
        toBoolean(params.Policies.PasswordPolicy, "RequireNumbers");
        toBoolean(params.Policies.PasswordPolicy, "RequireSymbols");
        toBoolean(params.Policies.PasswordPolicy, "RequireUppercase");
    }

    if (params.Schema) {
    	params.Schema.forEach(item => {
    		toBoolean(item, 'DeveloperOnlyAttribute');
    		toBoolean(item, 'Mutable');
    		toBoolean(item, 'Required');
    	});
    }

    return params;
}

var Create = function(params, env) {
    return new Promise((resolve, reject) => {
        cognitoidentityserviceprovider.createUserPool(resolveParamsType(params), function(err, data) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(data);
                resolve({
                    PhysicalResourceId: data.UserPool.Id,
                    Data: {
                        Id: data.UserPool.Id,
                        ProviderName: `cognito-idp.${env.Region}.amazonaws.com/${data.UserPool.Id}`,
                        Arn: arn(data.UserPool.Id, env.Region, env.AccountId)
                    }
                });
            }
        });
    });
};

var Update = function(physicalId, params, oldParams, env) {
    params.UserPoolId = physicalId;

    delete params.PoolName;
    delete params.Schema;
    delete params.UsernameAttributes;

    return new Promise((resolve, reject) => {
        cognitoidentityserviceprovider.updateUserPool(resolveParamsType(params), function(err, data) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve({
                    PhysicalResourceId: physicalId,
                    Data: {
                        Id: physicalId,
                        ProviderName: `cognito-idp.${env.Region}.amazonaws.com/${physicalId}`,
                        Arn: arn(physicalId, env.Region, env.AccountId)
                    }
                });
            }
        });
    });
};

var Delete = function(physicalId, env) {
    var p = {
        UserPoolId: physicalId
    };

    return new Promise((resolve, reject) => {
        cognitoidentityserviceprovider.deleteUserPool(p, function(err, data) {
            err ? reject(err) : resolve({
                PhysicalResourceId: physicalId,
                Data: {}
            });
        });
    });
};

exports.Create = Create;
exports.Update = Update;
exports.Delete = Delete;