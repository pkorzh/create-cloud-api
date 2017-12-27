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

*template.js* contains CFN template that is used to create the stack. Initially it defines only `lambdaExecutionRole` resource.

## Lambda Integration

`AWS_PROXY` is used as an integration type. Which means lambda should return its response in the following format:

```json
{
  "statusCode": 200,
  "body": "",
  "headers": {}
}
```

## Add API Key

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
