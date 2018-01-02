# create-cloud-api app

## Commands

### Deploy API

```sh
npm run deploy
```

Deploys the API.<br>
This command will create a build directory, sync it with S3 bucket and create CloudFormation stack for you.

The build consists of zipped lambdas functions and CloudFormation template generated using *template.js* file content as a starting point.

### Destroy API

```sh
npm run destroy
```

Deletes the stack. This action can't be undone or interrupted. If you re-deploy the API all IDs will be different.

### Eject

```sh
npm run eject
```

`eject` will copy all required scripts and configs into app folder. This action is permanent and cannot be undone.

### Template

```sh
npm run template -- cognito
```

`template` exists to add CFN resources to *template.js* file. Resources like cognito require app specific configuration: user attributes and identity pool roles. I find it best to manage this in CloudFormation template.

### Export API

```sh
npm run export-api -- <stage_name>
```

Exports Swagger API definition from AWS.

## Folder Structure

```
my-app
├── README.md
├── app.json
├── lambda
│   └── greeting
│       ├── index.js
│       └── package.json
├── package.json
├── swagger.yml
└── template.js
```

*lambda* is a folder that contains all the lambda functions. Each function is a separate NPM package with it’s own dependencies.

*app.json* file stores desired AWS region and lambda bucket name.

*swagger.yml* has sample greeting API defined. `operationId` param takes the form of `<lambda-name>-<handler>`. We assume the code in placed inside index.js file.

*template.js* contains CFN template that is used to create the stack. Initially it defines only `lambdaRestApiRole` resource.

## Lambda Integration

`AWS_PROXY` is used as an integration type. Which means lambda should return it's response in the following format:

```json
{
  "statusCode": 200,
  "body": "",
  "headers": {}
}
```

## Listing Lambda Functions

```js
const cca = require('cca-scripts');

console.log(
	cca.collectLambdas()
);

[ { name: 'greeting',
    zip: 'greeting-1.0.0.zip',
    description: 'Displays greetings',
    version: '1.0.0',
    keywords: [ 'greeting' ] } ]
```

## Getting Lambda ARN Inside Template

```js
  { 'Fn::GetAtt' : ['<lambda-name><lambda-handler-capitalized>', 'Arn'] }

  //e.g.

  { 'Fn::GetAtt' : ['greetingHandler', 'Arn'] }
```

## *package.json* `cca-scripts` Section

Lambda's *package.json* may contain `cca-scripts` section.

```diff
 {
   "name": "greeting",
   "version": "1.0.0",
   "private": true,
   "keywords": [
     "greeting"
   ],
+  "cca_scripts": {
+    "iam_role_name": "iam_role_name",
+    "timeout": 15
+  }
 }

```

## Add API Key Authorization

Add the lines bellow to *swagger.yml* file to enable API Key creation.

### For Swagger 2.0

```diff
 paths:
   /greeting:
     get:
       description: Displays greetings
       operationId: greeting-handler
+      security:
+        - api_key: []
...

+securityDefinitions:
+  api_key:
+    type: apiKey
+    name: x-api-key
+    in: header
```

## Add AWS IAM Authorization

### For Swagger 2.0

```diff
 paths:
   /greeting:
     get:
       description: Displays greetings
       operationId: greeting-handler
+      security:
+        - aws_iam: []
...

+securityDefinitions:
+  aws_iam:
+    type: apiKey
+    name: Authorization
+    in: header
+    x-amazon-apigateway-authtype: "awsSigv4"
```
