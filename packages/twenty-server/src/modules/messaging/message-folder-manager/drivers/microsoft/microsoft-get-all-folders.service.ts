import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  MessageFolder,
  MessageFolderDriver,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { MicrosoftHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-handle-error.service';
import { StandardFolder } from 'src/modules/messaging/message-import-manager/drivers/types/standard-folder';
import { getStandardFolderByRegex } from 'src/modules/messaging/message-import-manager/drivers/utils/get-standard-folder-by-regex';

@Injectable()
export class MicrosoftGetAllFoldersService implements MessageFolderDriver {
  private readonly logger = new Logger(MicrosoftGetAllFoldersService.name);

  constructor(
    private readonly microsoftClientProvider: MicrosoftClientProvider,
    private readonly microsoftHandleErrorService: MicrosoftHandleErrorService,
  ) {}

  async getAllMessageFolders(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'refreshToken' | 'id' | 'handle'
    >,
  ): Promise<MessageFolder[]> {
    try {
      const { client } =
        await this.microsoftClientProvider.getMicrosoftClient(connectedAccount);

      const response = await client.me.mailFolders.get();
      const folders = response?.value;
      const folderInfos: MessageFolder[] = [];

      if (!isDefined(folders)) {
        return [];
      }

      for (const folder of folders) {
        if (!folder.displayName) {
          continue;
        }

        const standardFolder = getStandardFolderByRegex(folder.displayName);

        if (this.shouldExcludeFolder(standardFolder)) {
          continue;
        }

        const isInbox = this.isInboxFolder(standardFolder);
        const isSentFolder = this.isSentFolder(standardFolder);

        folderInfos.push({
          externalId: folder.id!,
          name: folder.displayName,
          isSynced: isInbox || isSentFolder,
          isSentFolder,
        });
      }

      this.logger.log(
        `Found ${folderInfos.length} folders for Microsoft account ${connectedAccount.handle}`,
      );

      return folderInfos;
    } catch (error) {
      this.microsoftHandleErrorService.handleMicrosoftGetMessageListError(
        error,
      );
      this.logger.error(
        `Failed to get Microsoft folders for account ${connectedAccount.handle}:`,
        error,
      );

      throw error;
    }
  }

  private isInboxFolder(standardFolder: StandardFolder | null): boolean {
    return standardFolder === StandardFolder.INBOX;
  }

  private isSentFolder(standardFolder: StandardFolder | null): boolean {
    return standardFolder === StandardFolder.SENT;
  }

  private shouldExcludeFolder(standardFolder: StandardFolder | null): boolean {
    return (
      standardFolder !== null &&
      standardFolder !== StandardFolder.SENT &&
      standardFolder !== StandardFolder.INBOX
    );
  }
}
