import { Injectable } from '@nestjs/common';

import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { parseMicrosoftCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/parse-microsoft-calendar-error.util';
import { type GetCalendarEventsResponse } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { BaseDeltaFunctionResponse } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-graph-client/models';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { isAccessTokenRefreshingError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-access-token-refreshing-error.utils';

@Injectable()
export class MicrosoftCalendarGetEventsService {
  constructor(
    private readonly microsoftOAuth2ClientManagerService: MicrosoftOAuth2ClientManagerService,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    syncCursor?: string,
  ): Promise<GetCalendarEventsResponse> {
    try {
      const { client } =
        await this.microsoftOAuth2ClientManagerService.getOAuth2Client(
          connectedAccount.refreshToken,
        );
      const eventIds: string[] = [];

      const deltaBuilder = syncCursor
        ? client.me.events.delta.withUrl(syncCursor)
        : client.me.events.delta;

      let nextLink: string | undefined | null;
      let deltaLink: string | undefined | null;

      do {
        const response = nextLink
          ? await client.me.events.withUrl(nextLink).get()
          : await deltaBuilder.get({
              queryParameters: {
                select: ['id'],
                top: 999,
              },
            });

        response?.value?.forEach((value) => {
          eventIds.push(value.id!);
        });

        nextLink = response?.odataNextLink;
        const deltaResponse = response as BaseDeltaFunctionResponse;

        if (deltaResponse?.odataDeltaLink) {
          deltaLink = deltaResponse.odataDeltaLink;
        }
      } while (nextLink);

      return {
        fullEvents: false,
        calendarEventIds: eventIds,
        nextSyncCursor: deltaLink!,
      };
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
