import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export type MicrosoftMessageListFetchExceptionContext = {
  workspaceId: string;
  connectedAccountId: string;
  folderId?: string;
};

export class MicrosoftMessageListFetchException extends CustomException<
  string,
  MicrosoftMessageListFetchExceptionContext
> {
  constructor(
    message: string,
    code: string,
    context: MicrosoftMessageListFetchExceptionContext,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`Failed to fetch message list`,
      context,
    });
  }
}
