export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface ApiSuccessBody<TData extends JsonValue = JsonValue> {
  success: true;
  data: TData;
  correlationId?: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: JsonValue;
  };
  correlationId?: string;
}

export type ApiResponseBody<TData extends JsonValue = JsonValue> =
  | ApiSuccessBody<TData>
  | ApiErrorBody;
