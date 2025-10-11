import { Injectable, Logger } from '@nestjs/common';

import { type EmailAddress } from 'addressparser';
import { isDefined } from 'twenty-shared/utils';

import { Message } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-kiota-client/models';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';
import { safeParseEmailAddress } from 'src/modules/messaging/message-import-manager/utils/safe-parse.util';

import { MicrosoftFetchByBatchService } from './microsoft-fetch-by-batch.service';
import { MicrosoftHandleErrorService } from './microsoft-handle-error.service';

type ConnectedAccountType = Pick<
  ConnectedAccountWorkspaceEntity,
  'refreshToken' | 'id' | 'provider' | 'handle' | 'handleAliases'
>;

@Injectable()
export class MicrosoftGetMessagesService {
  private readonly logger = new Logger(MicrosoftGetMessagesService.name);

  constructor(
    private readonly microsoftFetchByBatchService: MicrosoftFetchByBatchService,
    private readonly microsoftHandleErrorService: MicrosoftHandleErrorService,
  ) {}

  async getMessages(
    messageIds: string[],
    connectedAccount: ConnectedAccountType,
  ): Promise<MessageWithParticipants[]> {
    try {
      const { batchResponses } =
        await this.microsoftFetchByBatchService.fetchAllByBatches(
          messageIds,
          connectedAccount,
        );

      const messages = this.formatBatchResponsesAsMessages(
        batchResponses,
        connectedAccount,
      );

      return messages;
    } catch (error) {
      this.microsoftHandleErrorService.handleMicrosoftGetMessagesError(error);

      return [];
    }
  }

  public formatBatchResponsesAsMessages(
    batchResponses: Message[],
    connectedAccount: ConnectedAccountType,
  ): MessageWithParticipants[] {
    return this.formatBatchResponseAsMessages(batchResponses, connectedAccount);
  }

  private formatBatchResponseAsMessages(
    batchResponse: Message[],
    connectedAccount: ConnectedAccountType,
  ): MessageWithParticipants[] {
    const messages = batchResponse.map((response) => {
      const safeParseFrom = response?.from?.emailAddress
        ? [safeParseEmailAddress(response.from.emailAddress)]
        : [];

      const safeParseTo = response?.toRecipients
        ?.filter(isDefined)
        .map((recipient: { emailAddress: EmailAddress }) =>
          safeParseEmailAddress(recipient.emailAddress),
        );

      const safeParseCc = response?.ccRecipients
        ?.filter(isDefined)
        .map((recipient: { emailAddress: EmailAddress }) =>
          safeParseEmailAddress(recipient.emailAddress),
        );

      const safeParseBcc = response?.bccRecipients
        ?.filter(isDefined)
        .map((recipient: { emailAddress: EmailAddress }) =>
          safeParseEmailAddress(recipient.emailAddress),
        );

      const participants = [
        ...(safeParseFrom
          ? formatAddressObjectAsParticipants(safeParseFrom, 'from')
          : []),
        ...(safeParseTo
          ? formatAddressObjectAsParticipants(safeParseTo, 'to')
          : []),
        ...(safeParseCc
          ? formatAddressObjectAsParticipants(safeParseCc, 'cc')
          : []),
        ...(safeParseBcc
          ? formatAddressObjectAsParticipants(safeParseBcc, 'bcc')
          : []),
      ];

      return {
        externalId: response.id,
        subject: response.subject || '',
        receivedAt: new Date(response.receivedDateTime),
        text:
          response.body?.contentType === 'text' ? response.body?.content : '',
        headerMessageId: response.internetMessageId,
        messageThreadExternalId: response.conversationId,
        direction: response.from
          ? computeMessageDirection(
              response.from.emailAddress.address,
              connectedAccount,
            )
          : MessageDirection.INCOMING,
        participants,
        attachments: [],
      };
    });

    return messages.filter(isDefined);
  }
}
