import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type Depth } from 'src/engine/api/rest/input-factories/depth-input.factory';

export enum CommonQueryNames {
  findOne = 'findOne',
  findMany = 'findMany',
}

export type RawSelectedFields = {
  graphqlSelectedFields?: Record<string, boolean>;
  depth?: Depth;
};

export interface FindOneQueryArgs {
  filter?: ObjectRecordFilter;
}

export interface FindManyQueryArgs {
  filter?: ObjectRecordFilter;
  orderBy?: ObjectRecordOrderBy;
  first?: number;
  last?: number;
  before?: string;
  after?: string;
}

export type CommonQueryArgs = FindOneQueryArgs | FindManyQueryArgs;
