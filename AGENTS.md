# AGENTS.md

## Repository Guide

This repository is a production-oriented AWS TypeScript Lambda template. It is intended to stay
small, explicit, and easy for teams to adapt when creating real Lambda-backed services.

When changing this project, preserve these priorities:

- Maintainability
- Simplicity
- Observability
- Developer experience
- AWS-native tooling
- Minimal operational overhead

Avoid overengineering. Prefer readable, conventional code over clever abstractions.

---

## Architecture Overview

The application code lives under `src/` and is separated by responsibility:

- `src/handlers`: Lambda entry points. Each file is bundled as an independent Lambda handler.
- `src/middlewares`: reusable middleware for handler wrapping, observability, correlation IDs, and error normalization.
- `src/services`: business or AWS service integration code.
- `src/utils`: shared stateless helpers such as HTTP responses and correlation ID utilities.
- `src/errors`: application error hierarchy and normalization helpers.
- `src/observability`: shared AWS Powertools logger, metrics, and tracer instances.
- `src/config`: runtime environment validation and type-safe config access.
- `src/types`: shared TypeScript types.

Infrastructure code lives under `infrastructure/`:

- `infrastructure/bin`: CDK app entry point.
- `infrastructure/lib`: stack and environment configuration.
- `infrastructure/constructs`: reusable CDK constructs.

Operational documentation lives in `README.md` and `docs/`.

---

## Runtime Standards

- Use the latest stable Node.js runtime supported by AWS Lambda managed runtimes.
- Use ARM64 architecture for Lambda functions.
- Use ESM modules.
- Use async/await exclusively.
- Do not use callback-based Lambda handlers.
- Use npm as the package manager.
- Declare AWS SDK v3 packages explicitly in `package.json`.
- Never rely on the AWS SDK version bundled by the Lambda runtime.
- Keep comments useful and sparse: explain intent, customization points, AWS-specific behavior, or non-obvious decisions.

Reference:
https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html

---

## Lambda Configuration

Lambda functions should include:

- ARM64 architecture
- Active tracing
- Structured JSON logs
- CloudWatch metrics support
- Source maps enabled through `NODE_OPTIONS=--enable-source-maps`
- Environment variables validated by the application config module

The primary application entry point is `src/handlers/app.ts`.

The health handler in `src/handlers/health.ts` is a lightweight smoke-test endpoint for deployment
verification, routing checks, configuration validation, and observability signals. It is not a
long-lived instance readiness probe.

---

## TypeScript

Keep TypeScript strict. The compiler configuration should preserve:

- `strict: true`
- `noImplicitAny: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `noFallthroughCasesInSwitch: true`
- `forceConsistentCasingInFileNames: true`

Generate declaration files for application source.

Enable source maps.

Use modern Node.js module resolution.

Lambda handlers must use explicit AWS Lambda types from the `aws-lambda` package.

Examples:

- API Gateway handlers should use `APIGatewayProxyEventV2`, `APIGatewayProxyStructuredResultV2`, and `Context`.
- EventBridge handlers should use `EventBridgeEvent` and `Context`.
- Do not leave handler event, context, or response values inferred as `any` or broad object types.

---

## Build

esbuild is used for fast Lambda bundling.

Build behavior should preserve:

- Tree shaking
- Production minification
- Source maps
- ARM64-compatible Node.js output
- Output directory: `dist/`

Expected scripts:

- `build`
- `build:watch`
- `clean`

Each `src/handlers/*.ts` file is treated as a Lambda entry point and bundled into `dist/handlers`.

---

## Testing

Jest is the unit test framework.

Testing should preserve:

- Unit tests
- Coverage reports
- CI integration
- TypeScript support
- ESM-compatible Jest configuration
- VSCode debugging support with breakpoints

Expected scripts:

- `test`
- `test:watch`
- `test:coverage`

Keep `.vscode/launch.json` able to debug all Jest tests and the current Jest file.

---

## Linting And Formatting

Use:

- ESLint
- `@typescript-eslint`
- Prettier

Maintain a zero-warning lint policy.

Expected scripts:

- `lint`
- `lint:fix`
- `format`
- `format:check`

CI must fail on lint, format, test, coverage, build, or CDK synth failures.

---

## Observability

AWS Powertools for AWS Lambda (TypeScript) is the observability foundation.

Reference:
https://docs.aws.amazon.com/powertools/typescript/latest/

### Logging

Use the shared logger from `src/observability/logger.ts`.

Handlers should preserve:

- Structured JSON logging
- Automatic cold start detection
- Lambda context enrichment
- Correlation ID support
- Service name support
- Log level configurable through environment variables

All Lambda handlers must use the shared logger, directly or through middleware.

### Metrics

Use AWS Powertools Metrics.

Reference:
https://docs.aws.amazon.com/powertools/typescript/latest/features/metrics/

Metrics should preserve:

- CloudWatch Embedded Metric Format
- Default dimensions
- Service dimension
- Custom metric helpers
- Dashboard-ready metric names

Standard metrics:

- `SuccessfulRequests`
- `FailedRequests`
- `ValidationErrors`

### Tracing

Use AWS Powertools Tracer.

Tracing should preserve:

- AWS X-Ray integration
- Automatic handler instrumentation
- Cold start annotation
- Service name annotation

---

## Middleware

Middleware should stay focused and practical.

Current middleware responsibilities:

- Lambda context injection
- Error normalization
- Correlation ID propagation
- Metrics publication
- Request lifecycle logging
- Powertools logger, metrics, and tracer integration

Do not introduce a framework or broad abstraction unless it clearly reduces repeated production code.

---

## Error Handling

Use the shared error hierarchy in `src/errors`.

Expected error types:

- `ApplicationError`
- `ValidationError`
- `NotFoundError`
- `UnauthorizedError`
- `ForbiddenError`
- `InternalServerError`

Unknown errors should be normalized before being returned to API Gateway.

---

## API Responses

Use standardized response helpers from `src/utils/http.ts`.

Expected helpers:

- `ok(...)`
- `created(...)`
- `badRequest(...)`
- `unauthorized(...)`
- `forbidden(...)`
- `notFound(...)`
- `internalServerError(...)`

Responses must keep a consistent JSON structure for success and error bodies.

---

## Configuration

Runtime configuration is validated in `src/config`.

Configuration behavior should preserve:

- Fail-fast validation
- Type-safe access
- Environment-specific values
- Safe defaults for local development and tests

---

## Infrastructure

Use AWS CDK v2 with TypeScript.

Reference:
https://docs.aws.amazon.com/cdk/v2/guide/home.html

Infrastructure should preserve:

- Application code and infrastructure code separated
- ARM64 Lambda architecture
- Active tracing
- CloudWatch Logs retention configuration
- Structured Lambda logging
- Environment variable configuration
- Least-privilege IAM permissions
- Separate environment config for `dev`, `staging`, and `production`

Keep reusable infrastructure behavior inside constructs, and keep stack files readable.

---

## GitHub Actions

CI runs on pull requests and pushes.

CI should perform:

1. Checkout code
2. Install dependencies
3. Run lint
4. Run format check
5. Run tests
6. Generate coverage
7. Build application
8. Synthesize CDK infrastructure

Deployment is manually dispatched and uses GitHub Environments for:

- `dev`
- `staging`
- `production`

AWS credentials must come from GitHub OIDC. Do not add long-lived AWS access keys.

Reference:
https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect

---

## Documentation

Keep documentation current when behavior changes.

README should cover:

- Project purpose
- Features
- Folder structure
- Getting started
- Local development
- Testing
- Build instructions
- CDK deployment instructions
- GitHub Actions overview
- Observability overview
- Example Lambda handler
- Example metric usage
- Example logger usage

Use `docs/` for operational detail that would make the README too long.

---

## Code Quality

Prioritize readability over cleverness.

Avoid unnecessary frameworks.

Prefer AWS-native solutions.

Minimize boilerplate while preserving explicitness.

When multiple implementation options exist, choose the one that:

1. Is widely adopted.
2. Has strong AWS alignment.
3. Minimizes operational complexity.
4. Improves long-term maintainability.
