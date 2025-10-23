import { Injectable } from '@nestjs/common';

import { GmailNetworkErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-network-error-handler.service';
import { parseGmailMessageListFetchError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-message-list-fetch-error.util';

@Injectable()
export class GmailMessageListFetchErrorHandler {
  constructor(
    private readonly gmailNetworkErrorHandler: GmailNetworkErrorHandler,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public handleError(error: any): void {
    const networkError = this.gmailNetworkErrorHandler.handleError(error);

    if (networkError) {
      throw networkError;
    }

    throw parseGmailMessageListFetchError(error, { cause: error });
  }
}
