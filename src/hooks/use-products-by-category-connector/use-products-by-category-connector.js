import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchProductsByCategoryQuery from './fetch-products-by-category.ctp.graphql';
import { convertToSortOptions } from '../../helpers';

export const useProductsByCategoryFetcher = (
  { categoryIds, page, perPage, tableSorting } = {}
) => {
  // Transformar el ordenamiento de tabla a formato compatible con GraphQL
  const sortOptions = convertToSortOptions(tableSorting);

  // Construir la cláusula where para filtrar por categorías
  let whereClause = null;
  
  if (categoryIds) {
    // Si es un solo ID, convertirlo a array
    const categories = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
    
    if (categories.length > 0) {
      // Si hay múltiples categorías, usar la sintaxis "in"
      if (categories.length === 1) {
        whereClause = `masterData(current(categories(id="${categories[0]}")))`;
      } else {
        const categoryValues = categories.map(id => `"${id}"`).join(', ');
        whereClause = `masterData(current(categories(id in (${categoryValues}))))`;
      }
    }
  }

  // Log para depuración antes de la consulta
  console.log('Ejecutando consulta con parámetros:', {
    limit: perPage || 20,
    offset: ((page || 1) - 1) * (perPage || 20),
    sort: sortOptions || [],
    where: whereClause || null,
  });

  const { data, error, loading } = useMcQuery(FetchProductsByCategoryQuery, {
    variables: {      limit: perPage || 20,
      offset: ((page || 1) - 1) * (perPage || 20),
      sort: sortOptions || [],
      where: whereClause || null,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
    fetchPolicy: 'network-only',
    // Solo ejecutar la consulta si hay categorías definidas
    skip: !categoryIds || (Array.isArray(categoryIds) && categoryIds.length === 0),
    onError: (err) => {
      console.error('Error en la consulta GraphQL:', {
        message: err.message,
        graphQLErrors: err.graphQLErrors,
        networkError: err.networkError,
        extraInfo: err.extraInfo,
      });
    },
    onCompleted: (result) => {
      if (result && result.products) {
        console.log(`Consulta completada: ${result.products.total} productos encontrados`);
      } else {
        console.warn('Consulta completada pero no se encontraron productos');
      }
    }
  });

  // Log para depuración después de la consulta
  if (error) {
    console.error('Error detectado en la consulta:', error);
  } else if (loading) {
    console.log('Consulta en progreso...');
  } else if (data) {
    console.log(`Datos recibidos: ${data?.products?.results?.length || 0} productos`);
  } else if (!loading && (!categoryIds || (Array.isArray(categoryIds) && categoryIds.length === 0))) {
    console.log('Consulta omitida: No hay categoryIds definidos');
  } else {
    console.log('Estado desconocido de la consulta');
  }

  // Simplemente devolvemos los datos sin procesar
  return {
    productsPaginatedResult: data?.products || null,
    error,
    loading,
  };
}; 