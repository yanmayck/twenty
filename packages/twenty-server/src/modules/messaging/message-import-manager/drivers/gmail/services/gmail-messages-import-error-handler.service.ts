import { Injectable } from '@nestjs/common';

import { GmailNetworkErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-network-error-handler.service';
import { parseGmailMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-messages-import-error.util';

@Injectable()
export class GmailMessagesImportErrorHandler {
  constructor(
    private readonly gmailNetworkErrorHandler: GmailNetworkErrorHandler,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleError(error: any, messageExternalId: string): void {
    const networkError = this.gmailNetworkErrorHandler.handleError(error);

    if (networkError) {
      throw networkError;
    }

    const gmailError = parseGmailMessagesImportError(error, messageExternalId, {
      cause: error,
    });

    if (gmailError) {
      throw gmailError;
    }
  }
}
