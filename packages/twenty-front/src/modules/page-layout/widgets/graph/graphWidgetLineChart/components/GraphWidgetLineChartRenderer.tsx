import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
import { useGraphLineChartWidgetData } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useGraphLineChartWidgetData';
import { lazy, Suspense, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type LineChartConfiguration,
  type PageLayoutWidget,
} from '~/generated/graphql';

const GraphWidgetLineChart = lazy(() =>
  import(
    '@/page-layout/widgets/graph/graphWidgetLineChart/components/GraphWidgetLineChart'
  ).then((module) => ({
    default: module.GraphWidgetLineChart,
  })),
);

export const GraphWidgetLineChartRenderer = ({
  widget,
}: {
  widget: PageLayoutWidget;
}) => {
  const { series, xAxisLabel, yAxisLabel, loading, error } =
    useGraphLineChartWidgetData({
      objectMetadataItemId: widget.objectMetadataId,
      configuration: widget.configuration as LineChartConfiguration,
    });

  const configuration = widget.configuration as LineChartConfiguration;

  const filterStateKey = useMemo(
    () =>
      `${configuration.rangeMin ?? ''}-${configuration.rangeMax ?? ''}-${configuration.omitNullValues ?? ''}`,
    [
      configuration.rangeMin,
      configuration.rangeMax,
      configuration.omitNullValues,
    ],
  );

  if (loading) {
    return <ChartSkeletonLoader />;
  }

  if (isDefined(error)) {
    // TODO: ideally should be replaced with a similar status to packages/twenty-front/src/modules/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay.tsx
    return <div>Error: {error.message}</div>;
  }

  return (
    <Suspense fallback={<ChartSkeletonLoader />}>
      <GraphWidgetLineChart
        key={filterStateKey}
        id={widget.id}
        data={series}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
        showLegend={true}
        showGrid={true}
        enablePoints={false}
        enableArea={true}
        stackedArea={false}
        lineWidth={1}
        enableSlices="x"
        displayType="shortNumber"
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: configuration.rangeMin ?? 'auto',
          max: configuration.rangeMax ?? 'auto',
          clamp: true,
        }}
      />
    </Suspense>
  );
};
