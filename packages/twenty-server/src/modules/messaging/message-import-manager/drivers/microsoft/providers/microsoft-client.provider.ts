import { Injectable } from '@nestjs/common';

import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary';

import { type MicrosoftGraphClient } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-graph-client/microsoftGraphClient';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class MicrosoftClientProvider {
  constructor(
    private readonly microsoftOAuth2ClientManagerService: MicrosoftOAuth2ClientManagerService,
  ) {}

  public async getMicrosoftClient(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'refreshToken' | 'id'
    >,
  ): Promise<{
    client: MicrosoftGraphClient;
    adapter: FetchRequestAdapter;
  }> {
    return await this.microsoftOAuth2ClientManagerService.getOAuth2Client(
      connectedAccount.refreshToken,
    );
  }
}
