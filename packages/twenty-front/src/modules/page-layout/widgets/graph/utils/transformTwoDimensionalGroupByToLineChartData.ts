import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { GRAPH_MAXIMUM_NUMBER_OF_GROUPS } from '@/page-layout/widgets/graph/constants/GraphMaximumNumberOfGroups.constant';
import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { computeAggregateValueFromGroupByResult } from '@/page-layout/widgets/graph/utils/computeAggregateValueFromGroupByResult';
import { formatDimensionValue } from '@/page-layout/widgets/graph/utils/formatDimensionValue';
import { getSortedKeys } from '@/page-layout/widgets/graph/utils/getSortedKeys';
import { isDefined } from 'twenty-shared/utils';
import { type LineChartConfiguration } from '~/generated/graphql';

type TransformTwoDimensionalGroupByToLineChartDataParams = {
  rawResults: GroupByRawResult[];
  groupByFieldX: FieldMetadataItem;
  groupByFieldY: FieldMetadataItem;
  aggregateField: FieldMetadataItem;
  configuration: LineChartConfiguration;
  aggregateOperation: string;
  objectMetadataItem: ObjectMetadataItem;
  primaryAxisSubFieldName?: string | null;
};

type TransformTwoDimensionalGroupByToLineChartDataResult = {
  series: LineChartSeries[];
};

export const transformTwoDimensionalGroupByToLineChartData = ({
  rawResults,
  groupByFieldX,
  groupByFieldY,
  aggregateField,
  configuration,
  aggregateOperation,
  objectMetadataItem,
}: TransformTwoDimensionalGroupByToLineChartDataParams): TransformTwoDimensionalGroupByToLineChartDataResult => {
  const seriesMap = new Map<string, Map<string, number>>();
  const xValues = new Set<string>();
  const yValues = new Set<string>();

  rawResults.forEach((result) => {
    const dimensionValues = result.groupByDimensionValues;
    if (!isDefined(dimensionValues) || dimensionValues.length < 2) return;

    const xValue = formatDimensionValue({
      value: dimensionValues[0],
      fieldMetadata: groupByFieldX,
      subFieldName: configuration.primaryAxisGroupBySubFieldName ?? undefined,
    });
    const yValue = formatDimensionValue({
      value: dimensionValues[1],
      fieldMetadata: groupByFieldY,
      subFieldName: configuration.secondaryAxisGroupBySubFieldName ?? undefined,
    });

    // TODO: Add a limit to the query instead of checking here (issue: twentyhq/core-team-issues#1600)
    const isNewX = !xValues.has(xValue);
    const isNewY = !yValues.has(yValue);
    const totalUniqueDimensions = xValues.size * yValues.size;
    const additionalDimensions =
      (isNewX ? 1 : 0) * yValues.size + (isNewY ? 1 : 0) * xValues.size;

    if (
      totalUniqueDimensions + additionalDimensions >
      GRAPH_MAXIMUM_NUMBER_OF_GROUPS
    ) {
      return;
    }

    const aggregateValue = computeAggregateValueFromGroupByResult({
      rawResult: result,
      aggregateField,
      aggregateOperation:
        configuration.aggregateOperation as unknown as ExtendedAggregateOperations,
      aggregateOperationFromRawResult: aggregateOperation,
      objectMetadataItem,
    });

    if (!isDefined(aggregateValue)) return;

    xValues.add(xValue);
    yValues.add(yValue);

    if (!seriesMap.has(yValue)) {
      seriesMap.set(yValue, new Map());
    }

    seriesMap.get(yValue)!.set(xValue, aggregateValue);
  });

  // Sorting needed because yValues may be unordered despite BE orderBy, if there are empty groups
  const sortedYValues = getSortedKeys({
    orderByY: configuration.secondaryAxisOrderBy,
    yValues: Array.from(yValues),
  });

  const series: LineChartSeries[] = sortedYValues.map((yValue) => {
    const dataMap = seriesMap.get(yValue)!;
    const data: LineChartDataPoint[] = Array.from(xValues).map((xValue) => ({
      x: xValue,
      y: dataMap.get(xValue) ?? 0,
    }));

    return {
      id: yValue,
      label: yValue,
      data,
    };
  });

  return {
    series,
  };
};
