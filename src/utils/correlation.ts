import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

export const getHeaderValue = (
  headers: APIGatewayProxyEventV2['headers'] | undefined,
  headerName: string
): string | undefined => {
  if (headers === undefined) {
    return undefined;
  }

  const normalizedHeaderName = headerName.toLowerCase();
  const header = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === normalizedHeaderName
  );

  return header?.[1];
};

export const getCorrelationId = (event: APIGatewayProxyEventV2): string =>
  getHeaderValue(event.headers, CORRELATION_ID_HEADER) ?? event.requestContext.requestId;
