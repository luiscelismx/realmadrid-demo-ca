import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchOrdersQuery from './fetch-orders.ctp.graphql';
import { convertToSortOptions } from '../../helpers';

export const useOrdersFetcher = (
  { page, perPage, tableSorting, channelId } = {}
) => {
  // Construir la cláusula where para filtrar por canal
  let whereClause = null;
  if (channelId && channelId !== 'all') {
    // Crear el predicado para filtrar pedidos que tienen líneas con este canal
    whereClause = `lineItems(distributionChannel(id="${channelId}"))`;
  }

  const { data, error, loading } = useMcQuery(FetchOrdersQuery, {
    variables: {
      limit: perPage,
      offset: (page - 1) * perPage,
      sort: convertToSortOptions(tableSorting),
      where: whereClause,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
    // Usar política de caché para evitar refrescar innecesariamente
    fetchPolicy: 'network-only',
  });

  return {
    ordersPaginatedResult: data?.orders,
    error,
    loading,
  };
}; 