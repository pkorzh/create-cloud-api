# create-cloud-api

# Work In Progress

Inspired by [react-create-app](https://github.com/facebookincubator/create-react-app) and [aws-serverless-auth-reference-app](https://github.com/awslabs/aws-serverless-auth-reference-app).

Build tool to deploy AWS powered APIs.

## Try It

Make sure you have AWS CLI [installed](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) and configured (run `aws configure`).

You’ll also need to have Node >= 6 on your machine.

```
npm install -g create-cloud-api
create-cloud-api my-app
cd my-app/
npm deploy
```

To get the API url run `npm run get-client-config`

```
{
  "ApiUrl": "https://v0rbu4v75i.execute-api.eu-west-1.amazonaws.com/dev"
}
```

Point your browser to https://v0rbu4v75i.execute-api.eu-west-1.amazonaws.com/dev/greeting.

## What's Inside

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

