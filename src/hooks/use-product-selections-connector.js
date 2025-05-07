import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchProductSelectionsQuery from '../components/user-management/graphql/fetch-product-selections.graphql';

export const useProductSelectionsFetcher = () => {
  const { data, error, loading } = useMcQuery(FetchProductSelectionsQuery, {
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    productSelections: data?.productSelections?.results || [],
    productSelectionsPagedResult: data?.productSelections,
    error,
    loading,
  };
}; 