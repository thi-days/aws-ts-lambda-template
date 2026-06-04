# Observability

Observability is implemented with AWS Powertools for AWS Lambda.

## Logger

`src/observability/logger.ts` creates the shared Logger instance.

All API Gateway handlers use `withApiGatewayMiddleware`, which enriches logs with:

- Lambda context
- cold start state
- service name
- correlation ID
- request lifecycle messages

Set `POWERTOOLS_LOG_LEVEL` per environment to control verbosity.

## Metrics

`src/observability/metrics.ts` creates the shared Metrics instance.

The metrics namespace comes from `POWERTOOLS_METRICS_NAMESPACE`. The service dimension is added
automatically by Powertools from `POWERTOOLS_SERVICE_NAME`; this template adds `stage` as a default
dimension.

Built-in metrics:

- `SuccessfulRequests`
- `FailedRequests`
- `ValidationErrors`

Use `addCustomMetric` for application-specific metrics.

## Tracing

`src/observability/tracer.ts` creates the shared Tracer instance.

The API Gateway middleware uses Powertools handler instrumentation. The CDK construct enables
Lambda active tracing, so traces are sent to AWS X-Ray when the function runs in AWS.

## Correlation IDs

Incoming `x-correlation-id` headers are propagated to:

- Powertools logger correlation ID
- structured log attributes
- X-Ray annotations
- API responses

When the caller does not provide a correlation ID, the API Gateway request ID is used.
