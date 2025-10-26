import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { filterOutGroupEmails } from 'src/modules/messaging/message-import-manager/utils/filter-out-group-emails.util';

describe('filterOutGroupEmails', () => {
  it('should filter out messages from noreply addresses', () => {
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'noreply-message',
        subject: 'Automated message',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'This is an automated message',
        headerMessageId: '<noreply@example.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: 'from',
            handle: 'noreply@example.com',
            displayName: 'No Reply',
          },
          {
            role: 'to',
            handle: 'user@example.com',
            displayName: 'User',
          },
        ],
        attachments: [],
      },
      {
        externalId: 'regular-message',
        subject: 'Personal message',
        receivedAt: new Date('2025-01-09T10:54:37.000Z'),
        text: 'This is a personal message',
        headerMessageId: '<john@example.com>',
        messageThreadExternalId: 'thread-2',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: 'from',
            handle: 'john@example.com',
            displayName: 'John Doe',
          },
          {
            role: 'to',
            handle: 'user@example.com',
            displayName: 'User',
          },
        ],
        attachments: [],
      },
    ];

    const result = filterOutGroupEmails(messages);

    expect(result).toHaveLength(1);
    expect(result[0].externalId).toBe('regular-message');
  });

  it('should filter out messages from info@ addresses', () => {
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'info-message',
        subject: 'Information',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'General information',
        headerMessageId: '<info@company.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: 'from',
            handle: 'info@company.com',
            displayName: 'Company Info',
          },
        ],
        attachments: [],
      },
    ];

    const result = filterOutGroupEmails(messages);

    expect(result).toEqual([]);
  });

  it('should filter out messages from support@ addresses', () => {
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'support-message',
        subject: 'Support ticket',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'Support response',
        headerMessageId: '<support@company.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: 'from',
            handle: 'support@company.com',
            displayName: 'Support Team',
          },
        ],
        attachments: [],
      },
    ];

    const result = filterOutGroupEmails(messages);

    expect(result).toEqual([]);
  });

  it('should keep messages without participants', () => {
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'no-participants',
        subject: 'Test',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'Test content',
        headerMessageId: '<test@example.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: undefined as any,
        attachments: [],
      },
    ];

    const result = filterOutGroupEmails(messages);

    expect(result).toEqual(messages);
  });

  it('should keep messages without a from participant', () => {
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'no-from',
        subject: 'Test',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'Test content',
        headerMessageId: '<test@example.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: 'to',
            handle: 'user@example.com',
            displayName: 'User',
          },
        ],
        attachments: [],
      },
    ];

    const result = filterOutGroupEmails(messages);

    expect(result).toEqual(messages);
  });

  it('should keep messages where from participant has no handle', () => {
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'no-handle',
        subject: 'Test',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'Test content',
        headerMessageId: '<test@example.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: 'from',
            handle: '',
            displayName: 'Unknown',
          },
        ],
        attachments: [],
      },
    ];

    const result = filterOutGroupEmails(messages);

    expect(result).toEqual(messages);
  });

  it('should filter out messages from no-reply addresses with hyphens', () => {
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'no-reply-message',
        subject: 'Automated notification',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'Notification',
        headerMessageId: '<no-reply@example.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: 'from',
            handle: 'no-reply@example.com',
            displayName: 'No Reply',
          },
        ],
        attachments: [],
      },
    ];

    const result = filterOutGroupEmails(messages);

    expect(result).toEqual([]);
  });

  it('should filter out messages from notification@ addresses', () => {
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'notification-message',
        subject: 'System notification',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'Notification content',
        headerMessageId: '<notifications@system.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: 'from',
            handle: 'notifications@system.com',
            displayName: 'Notifications',
          },
        ],
        attachments: [],
      },
    ];

    const result = filterOutGroupEmails(messages);

    expect(result).toEqual([]);
  });

  it('should keep regular personal email addresses', () => {
    const messages: MessageWithParticipants[] = [
      {
        externalId: 'personal-1',
        subject: 'Personal message',
        receivedAt: new Date('2025-01-09T09:54:37.000Z'),
        text: 'Content',
        headerMessageId: '<john.doe@example.com>',
        messageThreadExternalId: 'thread-1',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: 'from',
            handle: 'john.doe@example.com',
            displayName: 'John Doe',
          },
        ],
        attachments: [],
      },
      {
        externalId: 'personal-2',
        subject: 'Another message',
        receivedAt: new Date('2025-01-09T10:54:37.000Z'),
        text: 'Content',
        headerMessageId: '<jane.smith@company.com>',
        messageThreadExternalId: 'thread-2',
        direction: MessageDirection.INCOMING,
        participants: [
          {
            role: 'from',
            handle: 'jane.smith@company.com',
            displayName: 'Jane Smith',
          },
        ],
        attachments: [],
      },
    ];

    const result = filterOutGroupEmails(messages);

    expect(result).toEqual(messages);
  });
});
