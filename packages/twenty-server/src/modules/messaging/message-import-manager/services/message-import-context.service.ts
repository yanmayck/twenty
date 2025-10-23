import { Injectable, Scope } from '@nestjs/common';

// Request-scoped service that holds message import context
// This avoids passing context parameters through every method call
@Injectable({ scope: Scope.REQUEST })
export class MessageImportContextService {
  private messageChannelId: string | null = null;
  private workspaceId: string | null = null;
  private connectedAccountId: string | null = null;

  public setContext(context: {
    messageChannelId: string;
    workspaceId: string;
    connectedAccountId: string;
  }): void {
    this.messageChannelId = context.messageChannelId;
    this.workspaceId = context.workspaceId;
    this.connectedAccountId = context.connectedAccountId;
  }

  public getContext(): {
    messageChannelId: string;
    workspaceId: string;
    connectedAccountId: string;
  } | null {
    if (
      !this.messageChannelId ||
      !this.workspaceId ||
      !this.connectedAccountId
    ) {
      return null;
    }

    return {
      messageChannelId: this.messageChannelId,
      workspaceId: this.workspaceId,
      connectedAccountId: this.connectedAccountId,
    };
  }

  public clear(): void {
    this.messageChannelId = null;
    this.workspaceId = null;
    this.connectedAccountId = null;
  }
}
