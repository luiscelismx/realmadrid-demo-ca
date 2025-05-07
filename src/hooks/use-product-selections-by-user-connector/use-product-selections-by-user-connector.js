import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchProductSelectionsQuery from './fetch-product-selections.ctp.graphql';

export const useProductSelectionsByUserFetcher = () => {
  const { data, error, loading } = useMcQuery(FetchProductSelectionsQuery, {
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  console.log('Product Selections Data:', data);
  console.log('Product Selections Error:', error);

  return {
    productSelections: data?.productSelections?.results || [],
    productSelectionsPagedResult: data?.productSelections,
    error,
    loading,
  };
}; 