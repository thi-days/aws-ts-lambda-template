# Deployment

This template deploys through AWS CDK v2 and GitHub Actions OIDC.

## Environments

The supported deployment environments are:

- `dev`
- `staging`
- `production`

Environment-specific configuration lives in `infrastructure/lib/environment.ts`.

## Local CDK Commands

```bash
npm run build
npx cdk synth -c stage=dev
npx cdk deploy aws-ts-lambda-template-dev -c stage=dev
```

Change `stage` and stack name for `staging` or `production`.

## GitHub OIDC Setup

Create one IAM role per GitHub Environment or one shared role with conditions that restrict the
allowed repositories and environments.

The role trust policy should use GitHub as the federated principal and should not require static
AWS access keys:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<account-id>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:<github-org>/<repo-name>:environment:<environment-name>"
        }
      }
    }
  ]
}
```

Set this GitHub Environment variable for each environment:

- `AWS_ROLE_TO_ASSUME`: the IAM role ARN for that environment

The deployment workflow requests `id-token: write`, assumes the configured role, synthesizes CDK,
and deploys with `--require-approval never`.

## CDK Bootstrap

Bootstrap each AWS account and region before the first deployment:

```bash
npx cdk bootstrap aws://<account-id>/<region>
```

## Least Privilege

The sample Lambda receives:

- CloudWatch Logs permissions from the Lambda basic execution role
- X-Ray write permissions from active tracing
- `ssm:GetParameter` scoped to the configured Parameter Store path

Add service permissions explicitly in CDK as the application grows.
