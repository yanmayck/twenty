import { Injectable, Logger } from '@nestjs/common';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isAccessTokenRefreshingError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-access-token-refreshing-error.utils';
import { isMicrosoftClientTemporaryError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-temporary-error.utils';
import { parseMicrosoftMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/parse-microsoft-messages-import.util';
import { MessageImportContextService } from 'src/modules/messaging/message-import-manager/services/message-import-context.service';
import { MessageImportSyncStep } from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';

@Injectable()
export class MicrosoftHandleErrorService {
  private readonly logger = new Logger(MicrosoftHandleErrorService.name);

  constructor(
    private readonly messageImportContextService: MessageImportContextService,
  ) {}

  public handleMicrosoftGetMessageListError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
  ): never {
    const context = this.messageImportContextService.getContext();

    this.logger.log(`Error fetching message list`, error);

    const parsed = parseMicrosoftMessagesImportError(error);

    throw new MessageImportDriverException(
      parsed.message,
      parsed.code,
      context
        ? {
            ...context,
            syncStep: MessageImportSyncStep.MESSAGE_LIST_FETCH,
          }
        : undefined,
      { cause: error },
    );
  }

  public handleMicrosoftGetMessagesError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
  ): never {
    const context = this.messageImportContextService.getContext();

    this.logger.log(`Error fetching messages`, error);

    if (isAccessTokenRefreshingError(error?.body)) {
      throw new MessageImportDriverException(
        error.message,
        MessageImportDriverExceptionCode.CLIENT_NOT_AVAILABLE,
        context
          ? {
              ...context,
              syncStep: MessageImportSyncStep.MESSAGES_IMPORT_ONGOING,
            }
          : undefined,
        { cause: error },
      );
    }

    const isBodyString = error.body && typeof error.body === 'string';
    const isTemporaryError =
      isBodyString && isMicrosoftClientTemporaryError(error.body);

    if (isTemporaryError) {
      throw new MessageImportDriverException(
        `code: ${error.code} - body: ${error.body}`,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        context
          ? {
              ...context,
              syncStep: MessageImportSyncStep.MESSAGES_IMPORT_ONGOING,
            }
          : undefined,
        { cause: error },
      );
    }

    const parsed = parseMicrosoftMessagesImportError(error);

    throw new MessageImportDriverException(
      parsed.message,
      parsed.code,
      context
        ? {
            ...context,
            syncStep: MessageImportSyncStep.MESSAGES_IMPORT_ONGOING,
          }
        : undefined,
      { cause: error },
    );
  }
}
