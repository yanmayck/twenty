import { Injectable } from '@nestjs/common';

import { BatchRequestContent } from '@microsoft/msgraph-sdk-core';

import { Message } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-graph-client/models';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';

@Injectable()
export class MicrosoftFetchByBatchService {
  constructor(
    private readonly microsoftClientProvider: MicrosoftClientProvider,
  ) {}

  async fetchAllByBatches(
    messageIds: string[],
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'refreshToken' | 'id'
    >,
  ): Promise<{
    messageIdsByBatch: string[][];
    batchResponses: Message[];
  }> {
    const batchLimit = 20;
    const batchResponses: Message[] = [];
    const messageIdsByBatch: string[][] = [];

    const { client, adapter } =
      await this.microsoftClientProvider.getMicrosoftClient(connectedAccount);

    for (let i = 0; i < messageIds.length; i += batchLimit) {
      const batchMessageIds = messageIds.slice(i, i + batchLimit);
      const batchRequestContent = new BatchRequestContent(adapter, {});

      for (const messageId of batchMessageIds) {
        const requestInfo = client.me.messages
          .byMessageId(messageId)
          .content.toGetRequestInformation();

        batchRequestContent.addBatchRequest(requestInfo);
      }

      const batchResponse = await batchRequestContent.postAsync();

      if (batchResponse) {
        const responses = batchResponse.getResponses();

        for (const [_id, response] of responses) {
          if (response.status === 200 && response.body) {
            const decoder = new TextDecoder('utf-8');
            const mimeContent = JSON.parse(decoder.decode(response.body));

            batchResponses.push(mimeContent as Message);
          }
        }
      }
    }

    return {
      messageIdsByBatch,
      batchResponses,
    };
  }
}
