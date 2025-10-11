import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export type MicrosoftCalendarEventListFetchExceptionContext = {
  workspaceId: string;
  connectedAccountId: string;
  calendarId?: string;
};

export class MicrosoftCalendarEventListFetchException extends CustomException<
  string,
  MicrosoftCalendarEventListFetchExceptionContext
> {
  constructor(
    message: string,
    code: string,
    context: MicrosoftCalendarEventListFetchExceptionContext,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`Failed to fetch calendar event list`,
      context,
    });
  }
}
