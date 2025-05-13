import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchProductsByProviderQuery from './fetch-products-by-provider.ctp.graphql';
import { convertToSortOptions } from '../../helpers';

export const useProductsByProviderFetcher = (
  { providerKey, page, perPage, tableSorting } = {}
) => {
  console.log('useProductsByProviderFetcher - providerKey:', providerKey);
  console.log('useProductsByProviderFetcher - executing query:', !!providerKey);
  
  // Construir la cláusula where
  const where = providerKey
    ? `masterData(current(masterVariant(attributes(name="provider-key" and value(key="${providerKey}")))))`
    : '';

  // El hook siempre debe ser llamado, independientemente de si hay providerKey o no
  const { data, error, loading } = useMcQuery(FetchProductsByProviderQuery, {
    variables: {
      where,
      limit: perPage.value,
      offset: (page.value - 1) * perPage.value,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
    // Saltamos la ejecución de la consulta si no hay providerKey seleccionado
    skip: !providerKey,
    // Importante: forzar a Apollo a reconocer cuando cambia la variable providerKey
    fetchPolicy: 'network-only',
  });

  // Agregar console.log para depuración
  if (error) {
    console.error('Error en consulta de productos por proveedor:', error);
  }
  
  if (data) {
    console.log('Resultados de consulta productos por proveedor:', { 
      providerKey,
      resultsCount: data.products?.results?.length || 0,
      firstProduct: data.products?.results?.[0] ? {
        id: data.products.results[0].id,
        providerKey: data.products.results[0].masterData?.current?.masterVariant?.attributesRaw?.find(
          attr => attr.name === 'provider-key'
        )?.value?.[0]?.key
      } : null
    });
  }

  return {
    productsPaginatedResult: data?.products,
    error,
    loading,
  };
}; 