import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchProductsByStoreQuery from './fetch-products-by-store.ctp.graphql';
import { convertToSortOptions } from '../../helpers';

export const useProductsByStoreFetcher = (
  { productSelectionId, page, perPage, tableSorting } = {}
) => {
  // El hook siempre debe ser llamado, independientemente de si hay productSelectionId o no
  const { data, error, loading } = useMcQuery(FetchProductsByStoreQuery, {
    variables: {
      productSelectionId: productSelectionId,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
    // Saltamos la ejecución de la consulta si no hay productSelectionId seleccionado
    skip: !productSelectionId,
  });

  // Transformar los datos para mantener una estructura similar a la anterior
  const productsPaginatedResult = data?.productSelection?.productRefs 
    ? {
        total: data.productSelection.productRefs.results.length,
        count: data.productSelection.productRefs.results.length,
        offset: 0,
        results: data.productSelection.productRefs.results.map(ref => ref.product),
      }
    : null;

  return {
    productsPaginatedResult,
    error,
    loading,
  };
}; 