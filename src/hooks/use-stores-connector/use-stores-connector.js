import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchStoresQuery from './fetch-stores.ctp.graphql';

export const useStoresFetcher = () => {
  const { data, error, loading } = useMcQuery(FetchStoresQuery, {
    variables: {
      limit: 100, // Asumimos que no hay más de 100 tiendas
      offset: 0,
      sort: ['key asc'], // Ordenamos por key
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    stores: data?.stores?.results || [],
    storesPagedResult: data?.stores,
    error,
    loading,
  };
}; 