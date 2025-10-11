import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type BaseDeltaFunctionResponse } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-kiota-client/models';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { MicrosoftHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-handle-error.service';
import { isAccessTokenRefreshingError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-access-token-refreshing-error.utils';
import { type GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';
import {
  type GetMessageListsResponse,
  type GetOneMessageListResponse,
} from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';

// Microsoft API limit is 999 messages per request on this endpoint
const MESSAGING_MICROSOFT_USERS_MESSAGES_LIST_MAX_RESULT = 999;

@Injectable()
export class MicrosoftGetMessageListService {
  private readonly logger = new Logger(MicrosoftGetMessageListService.name);
  constructor(
    private readonly microsoftClientProvider: MicrosoftClientProvider,
    private readonly microsoftHandleErrorService: MicrosoftHandleErrorService,
  ) {}

  public async getMessageLists({
    messageChannel,
    connectedAccount,
    messageFolders,
  }: GetMessageListsArgs): Promise<GetMessageListsResponse> {
    const result: GetMessageListsResponse = [];

    if (messageFolders.length === 0) {
      throw new MessageImportDriverException(
        `Message channel ${messageChannel.id} has no message folders`,
        MessageImportDriverExceptionCode.NOT_FOUND,
      );
    }

    for (const folder of messageFolders) {
      const response = await this.getMessageList(connectedAccount, folder);

      result.push({
        ...response,
        folderId: folder.id,
      });
    }

    return result;
  }

  public async getMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    messageFolder: Pick<
      MessageFolderWorkspaceEntity,
      'name' | 'syncCursor' | 'externalId'
    >,
  ): Promise<GetOneMessageListResponse> {
    const messageExternalIds: string[] = [];
    const messageExternalIdsToDelete: string[] = [];

    try {
      const { client } =
        await this.microsoftClientProvider.getMicrosoftClient(connectedAccount);

      const syncCursor = messageFolder.syncCursor;
      const folderId = messageFolder.externalId;

      if (!isDefined(folderId)) {
        throw new Error('');
      }

      const deltaBuilder = syncCursor
        ? client.me.messages.delta.withUrl(syncCursor)
        : client.me.mailFolders.byMailFolderId(folderId).messages.delta;

      let nextLink: string | undefined | null;
      let deltaLink: string | undefined | null;

      do {
        const response = nextLink
          ? await client.me.messages.withUrl(nextLink).get()
          : await deltaBuilder.get({
              queryParameters: {
                select: ['id'],
                top: MESSAGING_MICROSOFT_USERS_MESSAGES_LIST_MAX_RESULT,
              },
            });

        response?.value?.forEach((message) => {
          if (message.id) {
            if (
              message.additionalData &&
              '@removed' in message.additionalData
            ) {
              messageExternalIdsToDelete.push(message.id);
            } else {
              messageExternalIds.push(message.id);
            }
          }
        });

        nextLink = response?.odataNextLink;
        const deltaResponse = response as BaseDeltaFunctionResponse;

        if (deltaResponse?.odataDeltaLink) {
          deltaLink = deltaResponse.odataDeltaLink;
        }
      } while (nextLink);

      return {
        messageExternalIds,
        messageExternalIdsToDelete,
        previousSyncCursor: syncCursor,
        nextSyncCursor: deltaLink || '',
        folderId: undefined,
      };
    } catch (error) {
      this.logger.error(
        `Connected account ${connectedAccount.id}: Error fetching message list: ${error instanceof Error ? error.message : String(error)}`,
      );

      if (isAccessTokenRefreshingError(error)) {
        throw new MessageImportDriverException(
          error instanceof Error ? error.message : String(error),
          MessageImportDriverExceptionCode.CLIENT_NOT_AVAILABLE,
        );
      }
      this.microsoftHandleErrorService.handleMicrosoftGetMessageListError(
        error,
      );

      throw error;
    }
  }
}
