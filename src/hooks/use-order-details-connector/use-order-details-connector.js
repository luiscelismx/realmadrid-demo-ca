import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchOrderById from './fetch-order-by-id.ctp.graphql';

export const useOrderDetailsFetcher = (orderId) => {
  const { data, error, loading, refetch } = useMcQuery(FetchOrderById, {
    variables: {
      orderId,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
    // Evitar caché para datos actualizados
    fetchPolicy: 'network-only',
  });

  return {
    order: data?.order,
    error,
    loading,
    refetch,
  };
}; 