import { Injectable, Logger } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingClearCursorsService } from 'src/modules/messaging/message-import-manager/services/messaging-clear-cursors.service';
import { MessagingDeleteGroupEmailMessagesService } from 'src/modules/messaging/message-import-manager/services/messaging-delete-group-email-messages.service';

@Injectable()
export class MessagingProcessGroupEmailActionsService {
  private readonly logger = new Logger(
    MessagingProcessGroupEmailActionsService.name,
  );

  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messagingDeleteGroupEmailMessagesService: MessagingDeleteGroupEmailMessagesService,
    private readonly messagingClearCursorsService: MessagingClearCursorsService,
  ) {}

  async processGroupEmailActions(
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    const { pendingGroupEmailsAction } = messageChannel;

    if (
      !pendingGroupEmailsAction ||
      pendingGroupEmailsAction === MessageChannelPendingGroupEmailsAction.NONE
    ) {
      return;
    }

    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Processing group email action: ${pendingGroupEmailsAction}`,
    );

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    try {
      if (
        pendingGroupEmailsAction ===
        MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_DELETION
      ) {
        await this.messagingDeleteGroupEmailMessagesService.deleteGroupEmailMessages(
          workspaceId,
          messageChannel.id,
        );

        await this.messagingClearCursorsService.clearAllCursors(
          messageChannel.id,
        );

        this.logger.log(
          `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Completed GROUP_EMAILS_DELETION action`,
        );
      } else if (
        pendingGroupEmailsAction ===
        MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_IMPORT
      ) {
        await this.messagingClearCursorsService.clearAllCursors(
          messageChannel.id,
        );

        this.logger.log(
          `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Completed GROUP_EMAILS_IMPORT action`,
        );
      }

      await messageChannelRepository.update(
        { id: messageChannel.id },
        {
          pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction.NONE,
        },
      );

      this.logger.log(
        `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Reset pendingGroupEmailsAction to NONE`,
      );
    } catch (error) {
      this.logger.error(
        `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Error processing group email action: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
