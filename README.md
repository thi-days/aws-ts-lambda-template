# AWS TypeScript Lambda Template

Production-grade AWS TypeScript Lambda template for AWS Lambda functions.

This repository is intentionally small: it gives teams a maintainable Lambda foundation with
AWS-native infrastructure, structured observability, typed handlers, Jest tests, and CI/CD
without introducing a large application framework.

## Features

- AWS Lambda Node.js 24 managed runtime
- ARM64 architecture
- ESM TypeScript with strict compiler settings
- Explicit `aws-lambda` handler types
- esbuild bundling with source maps and production minification
- Jest unit tests with coverage
- VSCode debug configuration for Jest breakpoints
- ESLint and Prettier with zero-warning CI enforcement
- AWS Powertools Logger, Metrics, and Tracer
- Standard API Gateway JSON responses
- Shared error hierarchy and error normalization
- Runtime environment validation with Zod
- AWS CDK v2 infrastructure for `dev`, `staging`, and `production`
- GitHub Actions CI and OIDC-based deployment workflow

## Folder Structure

```text
.
├── src
│   ├── handlers
│   ├── middlewares
│   ├── services
│   ├── utils
│   ├── errors
│   ├── observability
│   ├── config
│   └── types
├── tests
├── infrastructure
│   ├── bin
│   ├── lib
│   └── constructs
├── .github
│   └── workflows
├── .vscode
├── docs
└── scripts
```

## Getting Started

Use Node.js 24 or newer.

```bash
npm ci
npm test
npm run build
```

Copy `.env.example` when you need local environment values for scripts or ad hoc invocation.
The runtime config also provides safe local defaults for development and tests.

## Local Development

Run type checking, linting, formatting, and tests locally:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

Build once or watch handler bundles:

```bash
npm run build
npm run build:watch
```

The build writes bundled Lambda handlers to `dist/handlers` and declaration files to
`dist/types`.

## Application Entry Point

The initial application handler lives in `src/handlers/app.ts`.

Use it as the first implementation reference for real API Gateway Lambda work. It shows the
expected shape for:

- explicit AWS Lambda event, context, and response types
- `async` handler implementation
- shared middleware wrapping
- correlation ID propagation
- structured logging
- standardized JSON responses

The health check remains separate in `src/handlers/health.ts`. For Lambda, this is a lightweight
smoke-test endpoint for deployment verification, routing checks, configuration validation, and
observability signals rather than a long-lived instance readiness probe.

## Testing

Jest is configured for ESM TypeScript through SWC.

```bash
npm test
npm run test:watch
npm run test:coverage
```

Use the VSCode launch configurations `Debug Jest Tests` or `Debug Current Jest File` to debug
unit tests with breakpoints.

## Build

esbuild bundles every `src/handlers/*.ts` file as a Lambda entry point.

Production minification is enabled when `NODE_ENV=production`:

```bash
NODE_ENV=production npm run build
```

## CDK Deployment

Synthesize the default `dev` environment:

```bash
npm run cdk:synth
```

Synthesize a specific environment:

```bash
npx cdk synth -c stage=staging
```

Deploy after bootstrapping the target AWS account and region:

```bash
npm run build
npx cdk deploy aws-ts-lambda-template-dev -c stage=dev
```

Environment settings live in `infrastructure/lib/environment.ts`.

## GitHub Actions

`ci.yml` runs on pull requests and pushes to `main`:

1. Checkout code
2. Install dependencies
3. Run lint
4. Run format check
5. Run tests
6. Generate coverage
7. Build application
8. Synthesize CDK infrastructure

`deploy.yml` is manually dispatched and uses GitHub OIDC. Configure each GitHub Environment
(`dev`, `staging`, `production`) with:

- `AWS_ROLE_TO_ASSUME`: IAM role ARN trusted by GitHub OIDC

See [docs/deployment.md](docs/deployment.md) for the trust policy shape.

## Observability

AWS Powertools is configured in `src/observability`:

- Logger: structured JSON logs, Lambda context enrichment, cold start detection, correlation IDs
- Metrics: CloudWatch EMF, `SuccessfulRequests`, `FailedRequests`, `ValidationErrors`, custom metrics
- Tracer: X-Ray handler instrumentation, service annotation, cold start annotation

The CDK construct enables Lambda active tracing, JSON log format, source maps, and log retention.
See [docs/observability.md](docs/observability.md) for conventions.

## Example Lambda Handler

`src/handlers/app.ts` is the deployed application handler for the root route. Handlers use explicit AWS
Lambda types and `async` functions:

```typescript
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context
} from 'aws-lambda';
import { withApiGatewayMiddleware } from '../middlewares/api-gateway.js';
import { ok } from '../utils/http.js';

const appHandler = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyStructuredResultV2> => {
  return ok({
    requestId: context.awsRequestId,
    route: event.routeKey
  });
};

export const handler = withApiGatewayMiddleware(appHandler, {
  operationName: 'example'
});
```

## Example Metric Usage

```typescript
import { MetricUnit } from '@aws-lambda-powertools/metrics';
import { addCustomMetric } from './observability/index.js';

addCustomMetric('ItemsProcessed', 3, MetricUnit.Count);
```

## Example Logger Usage

```typescript
import { logger } from './observability/index.js';

logger.info('Order processed', {
  orderId: 'order-123'
});
```

## References

- [AWS Lambda Node.js runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html)
- [AWS Powertools for TypeScript](https://docs.aws.amazon.com/powertools/typescript/latest/)
- [AWS CDK v2](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
- [GitHub Actions OIDC for AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
