import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchProductsBySelectionQuery from './fetch-products-by-selection.ctp.graphql';
import { convertToSortOptions } from '../../helpers';

export const useProductsBySelectionFetcher = (
  { productSelectionId, page, perPage, tableSorting } = {}
) => {
  console.log('useProductsBySelectionFetcher - productSelectionId:', productSelectionId);
  console.log('useProductsBySelectionFetcher - executing query:', !!productSelectionId);
  
  // El hook siempre debe ser llamado, independientemente de si hay productSelectionId o no
  const { data, error, loading } = useMcQuery(FetchProductsBySelectionQuery, {
    variables: {
      productSelectionId,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
    // Saltamos la ejecución de la consulta si no hay productSelectionId seleccionado
    skip: !productSelectionId,
    // Importante: forzar a Apollo a reconocer cuando cambia la variable productSelectionId
    fetchPolicy: 'network-only',
  });

  // Agregar console.log para depuración
  if (error) {
    console.error('Error en consulta de productos por selección:', error);
  }
  
  if (data) {
    console.log('Resultados de consulta productos por selección:', { 
      productSelectionId,
      hasSelection: !!data.productSelection,
      resultsCount: data.productSelection?.productRefs?.results?.length || 0
    });
  }

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
    productSelection: data?.productSelection,
    error,
    loading,
  };
}; 