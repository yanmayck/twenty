import { Injectable, Logger } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageFolderPendingSyncAction,
  MessageFolderWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MessagingDeleteFolderMessagesService } from 'src/modules/messaging/message-import-manager/services/messaging-delete-folder-messages.service';

@Injectable()
export class MessagingProcessFolderActionsService {
  private readonly logger = new Logger(
    MessagingProcessFolderActionsService.name,
  );

  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messagingDeleteFolderMessagesService: MessagingDeleteFolderMessagesService,
  ) {}

  async processFolderActions(
    messageChannel: MessageChannelWorkspaceEntity,
    messageFolders: MessageFolderWorkspaceEntity[],
    workspaceId: string,
  ): Promise<void> {
    const messageFolderRepository =
      await this.twentyORMManager.getRepository<MessageFolderWorkspaceEntity>(
        'messageFolder',
      );

    const foldersWithPendingActions = messageFolders.filter(
      (folder) =>
        folder.pendingSyncAction &&
        folder.pendingSyncAction !== MessageFolderPendingSyncAction.NONE,
    );

    if (foldersWithPendingActions.length === 0) {
      return;
    }

    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Processing ${foldersWithPendingActions.length} folders with pending actions`,
    );

    for (const folder of foldersWithPendingActions) {
      try {
        this.logger.log(
          `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${folder.id} - Processing folder action: ${folder.pendingSyncAction}`,
        );

        if (
          folder.pendingSyncAction ===
          MessageFolderPendingSyncAction.FOLDER_DELETION
        ) {
          await this.messagingDeleteFolderMessagesService.deleteFolderMessages(
            workspaceId,
            messageChannel,
            folder,
          );

          this.logger.log(
            `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${folder.id} - Completed FOLDER_DELETION action`,
          );
        } else if (
          folder.pendingSyncAction ===
          MessageFolderPendingSyncAction.FOLDER_IMPORT
        ) {
          await messageFolderRepository.update(
            { id: folder.id },
            { syncCursor: '' },
          );

          this.logger.log(
            `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${folder.id} - Completed FOLDER_IMPORT action (cleared sync cursor)`,
          );
        }

        await messageFolderRepository.update(
          { id: folder.id },
          { pendingSyncAction: MessageFolderPendingSyncAction.NONE },
        );

        this.logger.log(
          `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${folder.id} - Reset pendingSyncAction to NONE`,
        );
      } catch (error) {
        this.logger.error(
          `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id}, FolderId: ${folder.id} - Error processing folder action: ${error.message}`,
          error.stack,
        );
      }
    }
  }
}
