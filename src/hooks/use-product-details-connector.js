import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchProductById from './fetch-product-by-id.ctp.graphql';

export const useProductDetailsFetcher = (productId, storeKey) => {
  const { data, error, loading, refetch } = useMcQuery(FetchProductById, {
    variables: {
      productId,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
    // Evitar caché para datos por tienda
    fetchPolicy: 'network-only',
  });

  return {
    product: data?.product,
    error,
    loading,
    refetch,
  };
}; 