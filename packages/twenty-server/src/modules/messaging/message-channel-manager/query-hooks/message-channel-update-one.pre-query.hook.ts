import { BadRequestException } from '@nestjs/common';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  MessageChannelSyncStage,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@WorkspaceQueryHook(`messageChannel.updateOne`)
export class MessageChannelUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<MessageChannelWorkspaceEntity>,
  ): Promise<UpdateOneResolverArgs<MessageChannelWorkspaceEntity>> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspace.id,
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOne({
      where: { id: payload.id },
    });

    if (!messageChannel) {
      throw new BadRequestException('Message channel not found');
    }

    const ongoingSyncStages = [
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
      MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
    ];

    const isSyncOngoing = ongoingSyncStages.includes(messageChannel.syncStage);

    const hasPendingActions =
      messageChannel.pendingGroupEmailsAction !== 'NONE';

    if (isSyncOngoing && hasPendingActions) {
      throw new BadRequestException(
        'Cannot update message channel while sync is ongoing with pending actions. Please wait for the sync to complete.',
      );
    }

    return payload;
  }
}
