import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import {
  ObjectRecord,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { RestApiBaseHandler } from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';

import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { EndingBeforeInputFactory } from 'src/engine/api/rest/input-factories/ending-before-input.factory';
import { LimitInputFactory } from 'src/engine/api/rest/input-factories/limit-input.factory';
import { StartingAfterInputFactory } from 'src/engine/api/rest/input-factories/starting-after-input.factory';
import { workspaceQueryRunnerRestApiExceptionHandler } from 'src/engine/api/rest/utils/workspace-query-runner-rest-api-exception-handler.util';

@Injectable()
export class RestApiFindManyHandler extends RestApiBaseHandler {
  constructor(
    private readonly commonFindManyQueryRunnerService: CommonFindManyQueryRunnerService,
    private readonly limitInputFactory: LimitInputFactory,
    private readonly endingBeforeInputFactory: EndingBeforeInputFactory,
    private readonly startingAfterInputFactory: StartingAfterInputFactory,
  ) {
    super();
  }

  async handle(request: Request) {
    try {
      const { args, rawSelectedFields } = await this.parseCommonArgs(request);
      const {
        authContext,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      } = await this.buildCommonOptions(request);

      const { records, aggregatedValues, hasNextPage, hasPreviousPage } =
        await this.commonFindManyQueryRunnerService.run({
          rawSelectedFields,
          args,
          authContext,
          objectMetadataMaps,
          objectMetadataItemWithFieldMaps,
        });

      return this.formatRestResponse(
        records,
        aggregatedValues,
        objectMetadataItemWithFieldMaps.namePlural,
        hasNextPage,
        hasPreviousPage,
        args.orderBy,
      );
    } catch (error) {
      workspaceQueryRunnerRestApiExceptionHandler(error);
    }
  }

  //tododo start cursor and end cursor
  private async formatRestResponse(
    records: ObjectRecord[],
    aggregatedValues: Record<string, number>,
    objectNamePlural: string,
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    orderBy: ObjectRecordOrderBy,
  ) {
    const { startCursor, endCursor } = this.getStartAndEndCursor(
      records,
      orderBy,
    );

    const pageInfo = {
      hasNextPage,
      hasPreviousPage,
      startCursor,
      endCursor,
    };

    return {
      data: {
        [objectNamePlural]: records,
      },
      totalCount: aggregatedValues.totalCount,
      pageInfo,
    };
  }

  private async parseCommonArgs(request: Request) {
    const depth = this.depthInputFactory.create(request);
    const limit = this.limitInputFactory.create(request);
    const orderBy = this.orderByRequestParser.parse(request);
    const filter = this.filterRequestParser.parse(request);
    const endingBefore = this.endingBeforeInputFactory.create(request);
    const startingAfter = this.startingAfterInputFactory.create(request);

    return {
      args: {
        filter,
        orderBy,
        first: !endingBefore ? limit : undefined,
        last: endingBefore ? limit : undefined,
        before: endingBefore,
        after: startingAfter,
      },
      rawSelectedFields: {
        depth,
      },
    };
  }
}
