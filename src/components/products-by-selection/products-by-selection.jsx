import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Link as RouterLink, useHistory, useRouteMatch, Switch } from 'react-router-dom';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { NO_VALUE_FALLBACK, GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import {
  usePaginationState,
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';
import { BackIcon } from '@commercetools-uikit/icons';
import Constraints from '@commercetools-uikit/constraints';
import FlatButton from '@commercetools-uikit/flat-button';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import DataTable from '@commercetools-uikit/data-table';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { Pagination } from '@commercetools-uikit/pagination';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import SelectField from '@commercetools-uikit/select-field';
import Card from '@commercetools-uikit/card';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import messages from './messages';
import { useProductsBySelectionFetcher } from '../../hooks/use-products-by-selection-connector';
import { useProductSelectionsByUserFetcher } from '../../hooks/use-product-selections-by-user-connector';
import { getErrorMessage } from '../../helpers';
import { useState, useEffect, useMemo, useRef } from 'react';
import ProductDetails from '../product-details';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

// Utilidad para obtener el nombre de una selección de productos
const getProductSelectionName = (productSelection, dataLocale, projectLanguages) => {
  if (!productSelection) return 'Desconocido';
  
  if (productSelection.nameAllLocales && productSelection.nameAllLocales.length > 0) {
    return formatLocalizedString(
      { name: transformLocalizedFieldToLocalizedString(productSelection.nameAllLocales) },
      {
        key: 'name',
        locale: dataLocale,
        fallbackOrder: projectLanguages,
        fallback: productSelection.key || productSelection.id || 'Sin nombre',
      }
    );
  }
  
  return productSelection.key || productSelection.id || 'Sin nombre';
};

const itemRenderer = (item, column, dataLocale, projectLanguages) => {
  switch (column.key) {
    case 'name':
      return item.masterData.current.nameAllLocales[0]?.value;
    case 'productType':
      return item.productType.name;
    case 'sku':
      return item?.key || '-';
    case 'price':
      const price = item.masterData.current.masterVariant?.prices?.[0]?.value;
      if (!price) return '-';
      return `${price.currencyCode} ${price.centAmount / 100}`;
    case 'lastModifiedAt':
      return item.lastModifiedAt;
    case 'status':
      return item.masterData.published;
    case 'createdAt':
      return item.createdAt;
    default:
      return item[column.key];
  }
};

// GraphQL query para buscar el custom object del usuario por key para recuperar su product selection preferido
const FETCH_USER_BY_KEY = gql`
  query FetchUserByKey($container: String!, $key: String!) {
    customObject(
      container: $container
      key: $key
    ) {
      id
      key
      value
    }
  }
`;

const ProductsBySelection = (props) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'name', order: 'asc' });
  
  // Definir las columnas aquí para tener acceso a intl
  const columns = [
    { key: 'name', label: intl.formatMessage(messages.name), isSortable: true },
    { key: 'sku', label: intl.formatMessage(messages.sku) },
    { key: 'productType', label: intl.formatMessage(messages.productType) },
    { key: 'price', label: intl.formatMessage(messages.price) },
    { key: 'status', label: intl.formatMessage(messages.status) },
    { key: 'createdAt', label: intl.formatMessage(messages.createdAt) },
    { key: 'lastModifiedAt', label: intl.formatMessage(messages.lastModifiedAt) },
  ];
  
  // Estados y refs
  const [selectedProductSelectionId, setSelectedProductSelectionId] = useState('');
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  
  const { dataLocale, projectLanguages, user } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project.languages,
    user: context.user,
  }));

  // Obtener el ID del usuario del contexto usando su email
  const userId = user?.email ? user.email.toLowerCase().replace('@', '~') : null;

  // Consultar el custom object del usuario
  const { 
    data: userData, 
    loading: userLoading, 
    error: userError 
  } = useQuery(FETCH_USER_BY_KEY, {
    variables: {
      container: "app-users",
      key: userId,
    },
    skip: !userId,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  // Efecto para procesar el custom object del usuario y establecer el ID de selección
  useEffect(() => {
    if (userLoading || !userData?.customObject?.value) return;

    try {
      console.log("Procesando datos del usuario:", userData.customObject);
      const userValue = userData.customObject.value;
      
      if (userValue.productSelectionIds && userValue.productSelectionIds.length > 0) {
        const defaultSelectionId = userValue.productSelectionIds[0];
        console.log("ID de selección encontrado en usuario:", defaultSelectionId);
        setSelectedProductSelectionId(defaultSelectionId);
        setIsInitialLoadComplete(true);
      } else {
        console.log("No se encontraron IDs de selección en el usuario");
        setIsInitialLoadComplete(true);
      }
    } catch (error) {
      console.error("Error procesando datos del usuario:", error);
      setIsInitialLoadComplete(true);
    }
  }, [userData, userLoading]);

  // Obtener productos filtrados
  const {
    productsPaginatedResult,
    error: productsError,
    loading: productsLoading,
  } = useProductsBySelectionFetcher({
    productSelectionId: selectedProductSelectionId,
    page,
    perPage,
    tableSorting,
  });

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Stack scale="xs">
        <Text.Headline as="h2" intlMessage={messages.title} />
        <Text.Subheadline as="h4" intlMessage={messages.subtitle} />
      </Spacings.Stack>

      <Constraints.Horizontal max={16}>
        <Card>
          <Spacings.Stack scale="l">
            {/* Mensajes de error o carga */}
            {userLoading && (
              <ContentNotification type="info">
                <Text.Body intlMessage={messages.loadingProductSelections} />
              </ContentNotification>
            )}
            {userError && (
              <ContentNotification type="error">
                <Text.Body>
                  {getErrorMessage(userError)}
                </Text.Body>
              </ContentNotification>
            )}
            {(productsLoading || !isInitialLoadComplete) && selectedProductSelectionId && (
              <ContentNotification type="info">
                <Text.Body intlMessage={messages.loadingProducts} />
              </ContentNotification>
            )}
            {productsError && (
              <ContentNotification type="error">
                <Text.Body>
                  {getErrorMessage(productsError)}
                  <br />
                  <strong>ID de selección:</strong> {selectedProductSelectionId}
                  <br />
                  <strong>Detalles del error:</strong> {JSON.stringify(productsError)}
                </Text.Body>
              </ContentNotification>
            )}

            {/* Tabla de productos */}
            {productsPaginatedResult?.results?.length > 0 && (
              <DataTable
                isCondensed
                columns={columns}
                rows={productsPaginatedResult.results}
                itemRenderer={(item, column) =>
                  itemRenderer(item, column, dataLocale, projectLanguages)
                }
                maxHeight={600}
                onRowClick={(row) => push(`${match.url}/${row.id}`)}
                onSortChange={tableSorting.onChange}
                sortDirection={tableSorting.value.order}
                sortedBy={tableSorting.value.key}
              />
            )}

            {/* Mensaje cuando no hay productos */}
            {productsPaginatedResult?.results?.length === 0 && !productsLoading && isInitialLoadComplete && (
              <ContentNotification type="info">
                <Text.Body intlMessage={messages.notFoundProducts} />
              </ContentNotification>
            )}

            {/* Paginación */}
            {productsPaginatedResult?.results?.length > 0 && (
              <Pagination
                page={page.value}
                onPageChange={page.onChange}
                perPage={perPage.value}
                onPerPageChange={perPage.onChange}
                totalItems={productsPaginatedResult.total}
              />
            )}
          </Spacings.Stack>
        </Card>
      </Constraints.Horizontal>

      {/* Rutas para detalles de productos */}
      <Switch>
        <SuspendedRoute path={`${match.path}/:id`}>
          <ProductDetails onClose={() => push(`${match.url}`)} />
        </SuspendedRoute>
      </Switch>
    </Spacings.Stack>
  );
};

ProductsBySelection.displayName = 'ProductsBySelection';
ProductsBySelection.propTypes = {
  linkToWelcome: PropTypes.string.isRequired,
};

export default ProductsBySelection; 