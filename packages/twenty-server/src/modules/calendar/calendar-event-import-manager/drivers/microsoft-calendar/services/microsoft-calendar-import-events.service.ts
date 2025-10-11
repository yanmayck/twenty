import { Injectable } from '@nestjs/common';

import { BatchRequestContent } from '@microsoft/msgraph-sdk-core';

import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { formatMicrosoftCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/format-microsoft-calendar-event.util';
import { parseMicrosoftCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/parse-microsoft-calendar-error.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { type Event as MicrosoftCalendarEvent } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-kiota-client/models';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { isAccessTokenRefreshingError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-access-token-refreshing-error.utils';

@Injectable()
export class MicrosoftCalendarImportEventsService {
  constructor(
    private readonly microsoftOAuth2ClientManagerService: MicrosoftOAuth2ClientManagerService,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    changedEventIds: string[],
  ): Promise<FetchedCalendarEvent[]> {
    try {
      const { client, adapter } =
        await this.microsoftOAuth2ClientManagerService.getOAuth2Client(
          connectedAccount.refreshToken,
        );

      const events: MicrosoftCalendarEvent[] = [];

      const batchLimit = 20;
      const allEvents: MicrosoftCalendarEvent[] = [];

      for (let i = 0; i < changedEventIds.length; i += batchLimit) {
        const batchEventIds = changedEventIds.slice(i, i + batchLimit);

        const batchRequestContent = new BatchRequestContent(adapter, {});

        for (const eventId of batchEventIds) {
          const eventRequestBuilder = client.me.events.byEventId(eventId);

          const requestInfo = eventRequestBuilder.toGetRequestInformation({
            headers: { Accept: 'application/json' },
          });

          batchRequestContent.addBatchRequest(requestInfo);
        }

        const batchResponse = await batchRequestContent.postAsync();

        if (batchResponse) {
          const responses = batchResponse.getResponses();

          for (const [_id, response] of responses) {
            if (response.status === 200 && response.body) {
              const decoder = new TextDecoder('utf-8');
              const mimeContent = JSON.parse(decoder.decode(response.body));

              allEvents.push(mimeContent);
            }
          }
        }
      }

      return formatMicrosoftCalendarEvents(events);
    } catch (error) {
      if (isAccessTokenRefreshingError(error?.body)) {
        throw new CalendarEventImportDriverException(
          error.message,
          CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }

      throw parseMicrosoftCalendarError(error);
    }
  }
}
