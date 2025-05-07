import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchCategoriesQuery from '../components/user-management/graphql/fetch-categories.graphql';

export const useCategoriesFetcher = () => {
  const { data, error, loading } = useMcQuery(FetchCategoriesQuery, {
    variables: {
      limit: 500, // Asumimos que no hay más de 500 categorías
      offset: 0,
      sort: ['key asc'], // Ordenamos por key
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    categories: data?.categories?.results || [],
    categoriesPagedResult: data?.categories,
    error,
    loading,
  };
}; 