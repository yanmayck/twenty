import { Injectable } from '@nestjs/common';

import { type Request } from 'express';

import { addDefaultConjunctionIfMissing } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/add-default-conjunction.utils';
import { checkFilterQuery } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/check-filter-query.utils';
import { parseFilterWithoutMetadataValidation } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/parse-filter-without-metadata-validation.utils';
import { type FieldValue } from 'src/engine/api/rest/core/types/field-value.type';

@Injectable()
export class FilterRequestParser {
  parse(request: Request): Record<string, FieldValue> {
    let filterQuery = request.query.filter;

    if (typeof filterQuery !== 'string') {
      return {};
    }

    checkFilterQuery(filterQuery);

    filterQuery = addDefaultConjunctionIfMissing(filterQuery);

    return parseFilterWithoutMetadataValidation(filterQuery);
  }
}
