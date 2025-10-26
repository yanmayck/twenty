import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { filterOutBlocklistedMessages } from 'src/modules/messaging/message-import-manager/utils/filter-out-blocklisted-messages.util';
import { filterOutIcsAttachments } from 'src/modules/messaging/message-import-manager/utils/filter-out-ics-attachments.util';
import { filterOutInternals } from 'src/modules/messaging/message-import-manager/utils/filter-out-internals.util';
import { isWorkEmail } from 'src/utils/is-work-email';

export const filterEmails = (
  primaryHandle: string,
  handleAliases: string[],
  messages: MessageWithParticipants[],
  blocklist: string[],
) => {
  const messagesWithoutIcsAttachments = filterOutIcsAttachments(messages);

  const messagesWithoutBlocklisted = filterOutBlocklistedMessages(
    [primaryHandle, ...handleAliases],
    messagesWithoutIcsAttachments,
    blocklist,
  );

  const messagesWithoutInternals = isWorkEmail(primaryHandle)
    ? filterOutInternals(primaryHandle, messagesWithoutBlocklisted)
    : messagesWithoutBlocklisted;

  return messagesWithoutInternals;
};
