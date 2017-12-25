# create-cloud-api

# Work In Progress

Inspired by [react-create-app](https://github.com/facebookincubator/create-react-app) and [aws-serverless-auth-reference-app](https://github.com/awslabs/aws-serverless-auth-reference-app).

No configuration build tool to deploy AWS powered APIs.

## Try it

```
npm install -g create-cloud-api
create-cloud-api my-app
cd my-app/
npm deploy
```

## What's inside

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

