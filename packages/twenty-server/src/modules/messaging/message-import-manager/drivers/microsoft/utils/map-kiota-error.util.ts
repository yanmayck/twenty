import { type ApiError } from '@microsoft/kiota-abstractions';

import { type ODataError } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-kiota-client/models/oDataErrors';

export type MappedKiotaError = {
  message: string;
  code: string;
  statusCode?: number;
  isTemporary: boolean;
  isAuthError: boolean;
};

const TEMPORARY_ERROR_CODES = [
  'ErrorServerBusy',
  'ErrorTimeoutExpired',
  'ErrorTooManyObjectsOpened',
  'ErrorInternalServerError',
  'ErrorServiceUnavailable',
  'RequestTimeout',
  'ServiceUnavailable',
];

const AUTH_ERROR_CODES = [
  'ErrorAccessDenied',
  'ErrorInvalidAccessToken',
  'ErrorTokenExpired',
  'Unauthenticated',
  'InvalidAuthenticationToken',
];

export const mapKiotaError = (error: unknown): MappedKiotaError => {
  if (isODataError(error)) {
    const errorCode = error.error?.code ?? 'UnknownError';
    const errorMessage =
      error.error?.message ?? error.message ?? 'Unknown error occurred';

    return {
      message: errorMessage,
      code: errorCode,
      statusCode: error.responseStatusCode,
      isTemporary: TEMPORARY_ERROR_CODES.includes(errorCode),
      isAuthError: AUTH_ERROR_CODES.includes(errorCode),
    };
  }

  if (isApiError(error)) {
    return {
      message: error.message,
      code: error.code ?? 'UnknownError',
      statusCode: error.responseStatusCode,
      isTemporary: false,
      isAuthError: false,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UnknownError',
      isTemporary: false,
      isAuthError: false,
    };
  }

  return {
    message: String(error),
    code: 'UnknownError',
    isTemporary: false,
    isAuthError: false,
  };
};

const isODataError = (error: unknown): error is ODataError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as { error?: unknown }).error === 'object'
  );
};

const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'responseStatusCode' in error
  );
};
