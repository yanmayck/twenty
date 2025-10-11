import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export type MicrosoftCalendarEventFetchExceptionContext = {
  workspaceId: string;
  connectedAccountId: string;
  eventIds: string[];
};

export class MicrosoftCalendarEventFetchException extends CustomException<
  string,
  MicrosoftCalendarEventFetchExceptionContext
> {
  constructor(
    message: string,
    code: string,
    context: MicrosoftCalendarEventFetchExceptionContext,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`Failed to fetch calendar events`,
      context,
    });
  }
}
