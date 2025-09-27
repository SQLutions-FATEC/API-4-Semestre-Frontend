export interface MirageRequest {
  params: Record<string, string>;
  queryParams: Record<string, string>;
  requestBody: string;
}

export interface MockRoute {
  method: string;
  url: string;
  result: (request: MirageRequest) => unknown;
}

export interface MockRouteParams {
  method: string;
  url: string;
  result: (request: MirageRequest) => unknown;
}

export interface SpecificError {
  status: number;
  message: string;
}

export interface APIFailureWrapperParams<T> {
  content: T;
  errorMessage?: string;
  specificError?: SpecificError;
  failureRate?: number;
}
