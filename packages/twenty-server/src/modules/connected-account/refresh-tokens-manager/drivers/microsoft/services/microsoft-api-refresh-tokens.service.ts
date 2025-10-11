import { Injectable } from '@nestjs/common';

import { ConfidentialClientApplication } from '@azure/msal-node';
import { z } from 'zod';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type ConnectedAccountTokens } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

export type MicrosoftTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class MicrosoftAPIRefreshAccessTokenService {
  private msalClient: ConfidentialClientApplication;

  constructor(private readonly twentyConfigService: TwentyConfigService) {
    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: this.twentyConfigService.get('AUTH_MICROSOFT_CLIENT_ID'),
        clientSecret: this.twentyConfigService.get(
          'AUTH_MICROSOFT_CLIENT_SECRET',
        ),
        authority: 'https://login.microsoftonline.com/common',
      },
    });
  }

  async refreshTokens(refreshToken: string): Promise<ConnectedAccountTokens> {
    const response = await this.msalClient.acquireTokenByRefreshToken({
      refreshToken,
      scopes: ['https://graph.microsoft.com/.default'],
    });

    if (!response || !response.accessToken) {
      throw new Error('Failed to acquire access token');
    }

    z.object({
      accessToken: z.string(),
    }).parse(response);

    return {
      accessToken: response.accessToken,
      refreshToken: refreshToken,
    };
  }
}
