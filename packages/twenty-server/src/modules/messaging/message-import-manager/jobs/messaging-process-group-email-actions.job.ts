import { Logger, Scope } from '@nestjs/common';

import { In } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  MessageChannelPendingGroupEmailsAction,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingProcessGroupEmailActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-group-email-actions.service';

export type MessagingProcessGroupEmailActionsJobData = {
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingProcessGroupEmailActionsJob {
  private readonly logger = new Logger(
    MessagingProcessGroupEmailActionsJob.name,
  );

  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messagingProcessGroupEmailActionsService: MessagingProcessGroupEmailActionsService,
  ) {}

  @Process(MessagingProcessGroupEmailActionsJob.name)
  async handle(data: MessagingProcessGroupEmailActionsJobData): Promise<void> {
    const { workspaceId } = data;

    this.logger.log(
      `Processing pending group email actions for workspace ${workspaceId}`,
    );

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    const messageChannels = await messageChannelRepository.find({
      where: {
        pendingGroupEmailsAction: In([
          MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_DELETION,
          MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_IMPORT,
        ]),
      },
    });

    this.logger.log(
      `Found ${messageChannels.length} message channels with pending group email actions in workspace ${workspaceId}`,
    );

    for (const messageChannel of messageChannels) {
      try {
        await this.messagingProcessGroupEmailActionsService.processGroupEmailActions(
          messageChannel,
          workspaceId,
        );
      } catch (error) {
        this.logger.error(
          `Error processing group email actions for message channel ${messageChannel.id} in workspace ${workspaceId}: ${error.message}`,
          error.stack,
        );
      }
    }
  }
}
