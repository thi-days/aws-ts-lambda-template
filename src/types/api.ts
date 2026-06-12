export interface ApiSuccessBody<TData> {
  success: true;
  data: TData;
  correlationId?: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: object;
  };
  correlationId?: string;
}

export type ApiResponseBody<TData> = ApiSuccessBody<TData> | ApiErrorBody;
