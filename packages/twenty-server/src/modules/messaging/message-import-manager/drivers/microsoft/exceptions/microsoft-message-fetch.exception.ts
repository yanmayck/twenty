import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export type MicrosoftMessageFetchExceptionContext = {
  workspaceId: string;
  connectedAccountId: string;
  messageIds: string[];
};

export class MicrosoftMessageFetchException extends CustomException<
  string,
  MicrosoftMessageFetchExceptionContext
> {
  constructor(
    message: string,
    code: string,
    context: MicrosoftMessageFetchExceptionContext,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`Failed to fetch messages`,
      context,
    });
  }
}
