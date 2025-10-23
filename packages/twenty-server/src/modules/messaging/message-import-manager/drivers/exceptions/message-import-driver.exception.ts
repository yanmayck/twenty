import { type MessageNetworkExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-network.exception';
import { type MessageImportSyncStep } from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';
import { CustomException } from 'src/utils/custom-exception';

export class MessageImportDriverException extends CustomException<
  MessageImportDriverExceptionCode | MessageNetworkExceptionCode
> {
  public readonly context?: {
    messageChannelId: string;
    workspaceId: string;
    connectedAccountId: string;
    syncStep: MessageImportSyncStep;
  };

  public cause?: Error;

  constructor(
    message: string,
    code: MessageImportDriverExceptionCode | MessageNetworkExceptionCode,
    context?: {
      messageChannelId: string;
      workspaceId: string;
      connectedAccountId: string;
      syncStep: MessageImportSyncStep;
    },
    options?: { cause?: Error },
  ) {
    super(message, code);
    this.context = context;
    this.name = 'MessageImportDriverException';

    // Preserve the original error's stack trace using error cause pattern
    if (options?.cause && options.cause instanceof Error) {
      this.cause = options.cause;
      // Append the original stack to provide full trace
      if (options.cause.stack) {
        this.stack = `${this.stack}\nCaused by: ${options.cause.stack}`;
      }
    }
  }
}

export enum MessageImportDriverExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  UNKNOWN = 'UNKNOWN',
  UNKNOWN_NETWORK_ERROR = 'UNKNOWN_NETWORK_ERROR',
  NO_NEXT_SYNC_CURSOR = 'NO_NEXT_SYNC_CURSOR',
  SYNC_CURSOR_ERROR = 'SYNC_CURSOR_ERROR',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  CLIENT_NOT_AVAILABLE = 'CLIENT_NOT_AVAILABLE',
}
