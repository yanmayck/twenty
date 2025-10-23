import { Injectable, Logger } from '@nestjs/common';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  MessageChannelSyncStatus,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageImportDriverException } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { parseImapError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-error.util';
import { parseImapMessageListFetchError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-message-list-fetch-error.util';
import { parseImapMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-messages-import-error.util';
import { MessageImportContextService } from 'src/modules/messaging/message-import-manager/services/message-import-context.service';
import { MessageImportSyncStep } from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';

@Injectable()
export class ImapHandleErrorService {
  private readonly logger = new Logger(ImapHandleErrorService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly messageImportContextService: MessageImportContextService,
  ) {}

  async handleError(
    error: Error,
    workspaceId: string,
    messageChannelId: string,
  ): Promise<void> {
    this.logger.error(
      `IMAP error for message channel ${messageChannelId}: ${error.message}`,
      error.stack,
    );

    try {
      const messageChannelRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
          workspaceId,
          'messageChannel',
        );

      await messageChannelRepository.update(
        { id: messageChannelId },
        {
          syncStatus: MessageChannelSyncStatus.FAILED_UNKNOWN,
        },
      );
    } catch (handleErrorError) {
      this.logger.error(
        `Error handling IMAP error: ${handleErrorError.message}`,
        handleErrorError.stack,
      );
    }
  }

  public handleImapMessageListFetchError(error: Error): never {
    const context = this.messageImportContextService.getContext();
    const imapError = parseImapError(error);

    if (imapError) {
      throw new MessageImportDriverException(
        imapError.message,
        imapError.code,
        context
          ? {
              ...context,
              syncStep: MessageImportSyncStep.MESSAGE_LIST_FETCH,
            }
          : undefined,
        { cause: error },
      );
    }

    const parsed = parseImapMessageListFetchError(error);

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

  public handleImapMessagesImportError(
    error: Error,
    messageExternalId: string,
  ): never {
    const context = this.messageImportContextService.getContext();
    const imapError = parseImapError(error);

    if (imapError) {
      throw new MessageImportDriverException(
        imapError.message,
        imapError.code,
        context
          ? {
              ...context,
              syncStep: MessageImportSyncStep.MESSAGES_IMPORT_ONGOING,
            }
          : undefined,
        { cause: error },
      );
    }

    const parsed = parseImapMessagesImportError(error, messageExternalId);

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
