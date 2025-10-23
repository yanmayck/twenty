import { Injectable } from '@nestjs/common';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isAxiosTemporaryError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-axios-gaxios-error.util';
import { parseGmailMessageListFetchError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-message-list-fetch-error.util';
import { parseGmailMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-messages-import-error.util';
import { MessageImportContextService } from 'src/modules/messaging/message-import-manager/services/message-import-context.service';
import { MessageImportSyncStep } from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';

@Injectable()
export class GmailHandleErrorService {
  constructor(
    private readonly messageImportContextService: MessageImportContextService,
  ) {}

  public handleGmailMessageListFetchError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
  ): never {
    const context = this.messageImportContextService.getContext();

    if (isAxiosTemporaryError(error)) {
      throw new MessageImportDriverException(
        error.message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        context
          ? {
              ...context,
              syncStep: MessageImportSyncStep.MESSAGE_LIST_FETCH,
            }
          : undefined,
        { cause: error },
      );
    }

    const parsed = parseGmailMessageListFetchError(error);

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

  public handleGmailMessagesImportError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
    messageExternalId: string,
  ): void {
    const context = this.messageImportContextService.getContext();

    if (isAxiosTemporaryError(error)) {
      throw new MessageImportDriverException(
        error.message,
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

    const parsed = parseGmailMessagesImportError(error, messageExternalId);

    if (parsed) {
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
}
