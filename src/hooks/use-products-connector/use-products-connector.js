import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchProductsByStoreQuery from './fetch-products-by-store.ctp.graphql';
import { convertToSortOptions } from '../../helpers';

export const useProductsByStoreFetcher = (
  { distributionChannelId, page, perPage, tableSorting } = {}
) => {
  const whereClause = `masterData(current(categories(id="${categories[0]}")))`;
  // El hook siempre debe ser llamado, independientemente de si hay distributionChannelId o no
  const { data, error, loading } = useMcQuery(FetchProductsByStoreQuery, {
    variables: {
      distributionChannelId: whereClause,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
    // Saltamos la ejecución de la consulta si no hay distributionChannelId seleccionado
    skip: !distributionChannelId,
  });

  // Transformar los datos para mantener una estructura similar a la anterior
  const productsPaginatedResult = data?.products 
    ? {
        total: data.products.total,
        count: data.products.count,
        offset: data.products.offset,
        results: data.products.results,
      }
    : null;

  return {
    productsPaginatedResult,
    error,
    loading,
  };
}; 