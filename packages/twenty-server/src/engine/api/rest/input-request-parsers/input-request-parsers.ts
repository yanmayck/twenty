import { FilterRequestParser } from 'src/engine/api/rest/input-request-parsers/filter.request-parser';
import { OrderByRequestParser } from 'src/engine/api/rest/input-request-parsers/order-by.request-parser';

export const inputRequestParsers = [OrderByRequestParser, FilterRequestParser];
