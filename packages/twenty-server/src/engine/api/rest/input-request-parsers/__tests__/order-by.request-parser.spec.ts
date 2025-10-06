import { Test, type TestingModule } from '@nestjs/testing';

import { OrderByDirection } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { OrderByRequestParser } from 'src/engine/api/rest/input-request-parsers/order-by.request-parser';

describe('OrderByRequestParser', () => {
  let service: OrderByRequestParser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderByRequestParser],
    }).compile();

    service = module.get<OrderByRequestParser>(OrderByRequestParser);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return default if order by missing', () => {
      const request: any = { query: {} };

      expect(service.parse(request)).toEqual([
        {},
        { id: OrderByDirection.AscNullsFirst },
      ]);
    });

    it('should create order by parser properly', () => {
      const request: any = {
        query: {
          order_by: 'fieldNumber[AscNullsFirst],fieldText[DescNullsLast]',
        },
      };

      expect(service.parse(request)).toEqual([
        { fieldNumber: OrderByDirection.AscNullsFirst },
        { fieldText: OrderByDirection.DescNullsLast },
        { id: OrderByDirection.AscNullsFirst },
      ]);
    });

    it('should choose default direction if missing', () => {
      const request: any = {
        query: {
          order_by: 'fieldNumber',
        },
      };

      expect(service.parse(request)).toEqual([
        { fieldNumber: OrderByDirection.AscNullsFirst },
        { id: OrderByDirection.AscNullsFirst },
      ]);
    });

    it('should handle complex fields', () => {
      const request: any = {
        query: {
          order_by: 'fieldCurrency.amountMicros',
        },
      };

      expect(service.parse(request)).toEqual([
        { fieldCurrency: { amountMicros: OrderByDirection.AscNullsFirst } },
        { id: OrderByDirection.AscNullsFirst },
      ]);
    });

    it('should handle complex fields with direction', () => {
      const request: any = {
        query: {
          order_by: 'fieldCurrency.amountMicros[DescNullsLast]',
        },
      };

      expect(service.parse(request)).toEqual([
        { fieldCurrency: { amountMicros: OrderByDirection.DescNullsLast } },
        { id: OrderByDirection.AscNullsFirst },
      ]);
    });

    it('should handle multiple complex fields with direction', () => {
      const request: any = {
        query: {
          order_by:
            'fieldCurrency.amountMicros[DescNullsLast],fieldText.label[AscNullsLast]',
        },
      };

      expect(service.parse(request)).toEqual([
        { fieldCurrency: { amountMicros: OrderByDirection.DescNullsLast } },
        { fieldText: { label: OrderByDirection.AscNullsLast } },
        { id: OrderByDirection.AscNullsFirst },
      ]);
    });

    it('should throw if direction invalid', () => {
      const request: any = {
        query: {
          order_by: 'fieldText[invalid]',
        },
      };

      expect(() => service.parse(request)).toThrow(
        "'order_by' direction 'invalid' invalid. Allowed values are 'AscNullsFirst', 'AscNullsLast', 'DescNullsFirst', 'DescNullsLast'. eg: ?order_by=field_1[AscNullsFirst],field_2[DescNullsLast],field_3",
      );
    });
  });
});
