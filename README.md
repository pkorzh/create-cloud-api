# create-cloud-api

# Work In Progress

Inspired by [react-create-app](https://github.com/facebookincubator/create-react-app) and [aws-serverless-auth-reference-app](https://github.com/awslabs/aws-serverless-auth-reference-app).

Build tool to deploy AWS powered APIs.

## Try It

Make sure you have AWS CLI [installed](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) and configured (run `aws configure`).

You’ll also need to have Node >= 6 on your machine.

```sh
npm install -g create-cloud-api
create-cloud-api my-app
cd my-app/
npm deploy
```

To get the API url run `npm run get-client-config`

```json
{
  "baseUrl": "https://<api-id>.execute-api.<region>.amazonaws.com/dev"
}
```

Point your browser to `<baseUrl>/greeting`.

## How To

Read the full [user guide](https://github.com/pkorzh/create-cloud-api/blob/master/packages/cca-scripts/template/README.md).

Here's some topic selection:

- [Add API Key Authorization](https://github.com/pkorzh/create-cloud-api/blob/master/packages/cca-scripts/template/README.md#add-api-key-authorization)
- [Add AWS IAM Authorization](https://github.com/pkorzh/create-cloud-api/blob/master/packages/cca-scripts/template/README.md#add-aws-iam-authorization)
- [Listing Lambda Functions](https://github.com/pkorzh/create-cloud-api/blob/master/packages/cca-scripts/template/README.md#listing-lambda-functions)
