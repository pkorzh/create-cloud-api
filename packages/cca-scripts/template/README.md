# create-cloud-api app

## Deploy API

```
npm run deploy
```

## Destroy API

```
npm run destroy
```

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

- `app.json` Lambda bucket and AWS region configuration.
- `lambda` lambda's code folder.
- `swagger.yml` API definitions.
- `template.js` CloudFormation template.
