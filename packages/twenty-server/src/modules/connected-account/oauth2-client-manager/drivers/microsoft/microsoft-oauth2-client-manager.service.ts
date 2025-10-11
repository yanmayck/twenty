import { Injectable, Logger } from '@nestjs/common';

import { ConfidentialClientApplication } from '@azure/msal-node';
import { AzureIdentityAuthenticationProvider } from '@microsoft/kiota-authentication-azure';
import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary';

import type { AccessToken, TokenCredential } from '@azure/core-auth';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  createMicrosoftKiotaClient,
  type MicrosoftKiotaClient,
} from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-kiota-client/microsoftKiotaClient';
import { ConnectedAccountRefreshAccessTokenExceptionCode } from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';

interface TokenCacheEntry {
  accessToken: string;
  expiresOn: Date;
}

@Injectable()
export class MicrosoftOAuth2ClientManagerService {
  private readonly logger = new Logger(
    MicrosoftOAuth2ClientManagerService.name,
  );
  private msalClient: ConfidentialClientApplication;
  private tokenCache: Map<string, TokenCacheEntry> = new Map();

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

  public async getOAuth2Client(refreshToken: string): Promise<{
    client: MicrosoftKiotaClient;
    adapter: FetchRequestAdapter;
  }> {
    const tokenCredential: TokenCredential = {
      getToken: async (
        scopes: string | string[],
      ): Promise<AccessToken | null> => {
        try {
          const scopesArray = Array.isArray(scopes) ? scopes : [scopes];
          const cacheKey = `${refreshToken}:${scopesArray.sort().join(',')}`;

          // Check if we have a cached token that's still valid (with 5 min buffer)
          const cached = this.tokenCache.get(cacheKey);

          if (
            cached &&
            cached.expiresOn.getTime() > Date.now() + 5 * 60 * 1000
          ) {
            return {
              token: cached.accessToken,
              expiresOnTimestamp: cached.expiresOn.getTime(),
            };
          }

          const response = await this.msalClient.acquireTokenByRefreshToken({
            refreshToken,
            scopes: scopesArray,
          });

          if (!response || !response.accessToken || !response.expiresOn) {
            this.logger.error('Failed to acquire access token');
            throw new Error(
              `${MicrosoftOAuth2ClientManagerService.name} error: ${ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_ACCESS_TOKEN_FAILED}`,
            );
          }

          // Cache the token
          this.tokenCache.set(cacheKey, {
            accessToken: response.accessToken,
            expiresOn: response.expiresOn,
          });

          return {
            token: response.accessToken,
            expiresOnTimestamp: response.expiresOn.getTime(),
          };
        } catch (error) {
          this.logger.error(
            `Failed to refresh token: ${error instanceof Error ? error.message : String(error)}`,
          );
          throw error;
        }
      },
    };

    const authProvider = new AzureIdentityAuthenticationProvider(
      tokenCredential,
      ['https://graph.microsoft.com/.default'],
    );

    const requestAdapter = new FetchRequestAdapter(authProvider);
    const client = createMicrosoftKiotaClient(requestAdapter);

    return {
      client,
      adapter: requestAdapter,
    };
  }
}
