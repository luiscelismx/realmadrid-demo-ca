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
import Card from '@commercetools-uikit/card';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import messages from './messages';
import { useProductsByCategoryFetcher } from '../../hooks/use-products-by-category-connector';
import { getErrorMessage } from '../../helpers';
import { useState, useEffect } from 'react';
import ProductDetails from '../product-details';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';


// Definición de columnas para la tabla de productos
const columns = [
  { key: 'name', label: 'Nombre', isSortable: true },
  { key: 'sku', label: 'SKU' },
  { key: 'productType', label: 'Tipo de producto' },
  { key: 'availability', label: 'Disponibilidad' },
  { key: 'status', label: 'Estado' },
];

// Renderizador de items para la tabla
const itemRenderer = (item, column, dataLocale, projectLanguages) => {
  switch (column.key) {
    case 'name':
      return item.masterData.current.nameAllLocales?.[0]?.value || '-';
    case 'productType':
      return item.productType.name;
    case 'sku':
      return item?.key || '-';
    case 'availability':
      return 'No filtrado';
    case 'status':
      return item.masterData.published ? 'Publicado' : 'No publicado';
    default:
      return item[column.key];
  }
};

// GraphQL query para buscar el custom object del usuario por key
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

const ProductsByCategory = (props) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'name', order: 'asc' });
  const [userCategoryIds, setUserCategoryIds] = useState([]);
  const [userLoaded, setUserLoaded] = useState(false);
  
  const { dataLocale, projectLanguages, user } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project.languages,
    user: context.user,
  }));

  // Obtener el ID del usuario del contexto
  const userId = user?.id;

  // Consultar el custom object del usuario por key (que es el ID del usuario)
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

  // Efecto para extraer el ID del canal del usuario cuando se cargan los datos
  useEffect(() => {
    if (!userLoaded && userData && !userLoading) {
      try {
        const userCustomObject = userData.customObject;
        
        if (userCustomObject) {
          console.log('Usuario encontrado:', userCustomObject);
          
          // Parsear el value si es string
          const userValue = typeof userCustomObject.value === 'string' 
            ? JSON.parse(userCustomObject.value) 
            : userCustomObject.value;
          

          // Obtener categoryIds del usuario
          const categoryIds = Array.isArray(userValue.categoryIds) ? userValue.categoryIds : [];
          console.log('Category IDs del usuario:', categoryIds);
          
          if (categoryIds.length > 0) {
            console.log('Category IDs seleccionados del usuario:', categoryIds);
            setUserCategoryIds(categoryIds);
          } else {
            console.warn('El usuario no tiene categorías asignadas');
          }
        } else {
          console.warn('No se encontró el custom object del usuario');
        }
      } catch (error) {
        console.error('Error al procesar datos del usuario:', error);
      } finally {
        setUserLoaded(true);
      }
    }
  }, [userData, userLoading, userLoaded]);

  // Obtener productos usando el hook (filtrando por categoryIds)
  const { 
    productsPaginatedResult, 
    error: productsError, 
    loading: productsLoading 
  } = useProductsByCategoryFetcher({
    categoryIds: userCategoryIds,
    page: page.value,
    perPage: perPage.value,
    tableSorting: tableSorting.value,
  });

  const error = userError || productsError;

  // Manejo mejorado de errores
  if (error) {
    console.error('Error detectado:', error);
    
    // Extraer detalles específicos para GraphQL
    const graphQLErrors = error.graphQLErrors || [];
    const networkError = error.networkError;
    
    return (
      <Spacings.Stack scale="m">
        <ContentNotification type="error">
          <Text.Headline as="h3">Error al cargar los datos</Text.Headline>
          <Text.Body>{getErrorMessage(error)}</Text.Body>
          
          {/* Detalles adicionales para ayudar a depurar */}
          {graphQLErrors.length > 0 && (
            <Spacings.Stack scale="s">
              <Text.Body>Errores GraphQL:</Text.Body>
              <ul>
                {graphQLErrors.map((gqlError, index) => (
                  <li key={index}>
                    <Text.Body>{gqlError.message || "Error desconocido"}</Text.Body>
                  </li>
                ))}
              </ul>
            </Spacings.Stack>
          )}
          
          {networkError && (
            <Text.Body>Error de red: {networkError.message || "Error de conexión"}</Text.Body>
          )}
          
          {userCategoryIds.length > 0 && (
            <Text.Body>
              <strong>Intentando filtrar por categoría(s):</strong> {userCategoryIds.join(', ')}
            </Text.Body>
          )}
        </ContentNotification>
        
        <FlatButton
          as={RouterLink}
          to={props.linkToWelcome}
          label={intl.formatMessage(messages.backToWelcome)}
          icon={<BackIcon />}
        />
      </Spacings.Stack>
    );
  }

  // Mostrar spinner mientras se cargan los datos del usuario
  if (!userLoaded && (userLoading || !userData)) {
    return (
      <Spacings.Stack scale="s" alignItems="center">
        <LoadingSpinner />
        <Text.Body intlMessage={messages.loadingUserData} />
      </Spacings.Stack>
    );
  }

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Stack scale="xs">
        <FlatButton
          as={RouterLink}
          to={props.linkToWelcome}
          label={intl.formatMessage(messages.backToWelcome)}
          icon={<BackIcon />}
        />
        <Text.Headline as="h2" intlMessage={messages.title} />
      </Spacings.Stack>

      {userData && userData.customObject && (
        <Spacings.Stack scale="m">
          <Card>
            <Spacings.Stack scale="m">
              <Text.Headline as="h3" intlMessage={messages.userInfo} />
              <Spacings.Stack scale="s">
                <Text.Body>
                  <strong>ID:</strong> {userId || 'No disponible'}
                </Text.Body>
                {(() => {
                  try {
                    const userObject = userData.customObject;
                    const userValue = typeof userObject.value === 'string' 
                      ? JSON.parse(userObject.value) 
                      : userObject.value;
                    
                    const categoryIds = Array.isArray(userValue.categoryIds) ? userValue.categoryIds : [];
                    
                    return (
                      <>
                        <Text.Body>
                          <strong>Email:</strong> {userValue.email || 'No disponible'}
                        </Text.Body>
                        <Text.Body>
                          <strong>Nombre:</strong> {userValue.name || 'No disponible'}
                        </Text.Body>
                        <Text.Body>
                          <strong>Roles:</strong> {Array.isArray(userValue.roles) ? userValue.roles.join(', ') : 'No disponible'}
                        </Text.Body>
                        <Text.Body>
                          <strong>Categorías asignadas:</strong> {categoryIds.length > 0 ? categoryIds.join(', ') : 'No asignadas'}
                        </Text.Body>
                      </>
                    );
                  } catch (error) {
                    return <Text.Body>Error al procesar los datos del usuario: {error.message}</Text.Body>;
                  }
                })()}
              </Spacings.Stack>
            </Spacings.Stack>
          </Card>
        </Spacings.Stack>
      )}

      {userCategoryIds.length === 0 && userLoaded && (
        <ContentNotification type="warning">
          <Text.Body intlMessage={messages.noCategory} />
        </ContentNotification>
      )}

      {productsLoading && userCategoryIds.length > 0 && (
        <Spacings.Stack scale="s" alignItems="center">
          <LoadingSpinner />
          <Text.Body intlMessage={messages.loadingProducts} />
        </Spacings.Stack>
      )}

      {productsPaginatedResult ? (
        <Spacings.Stack scale="l">
          
          <DataTable
            isCondensed
            columns={columns}
            rows={productsPaginatedResult.results || []}
            itemRenderer={(item, column) => itemRenderer(item, column, dataLocale, projectLanguages)}
            sortedBy={tableSorting.value.key}
            sortDirection={tableSorting.value.order}
            onSortChange={tableSorting.onChange}
            onRowClick={(row) => push(`${match.url}/${row.id}`)}
          />
          {productsPaginatedResult.results && productsPaginatedResult.results.length > 0 ? (
            <Pagination
              page={page.value}
              onPageChange={page.onChange}
              perPage={perPage.value}
              onPerPageChange={perPage.onChange}
              totalItems={productsPaginatedResult.total}
            />
          ) : (
            <ContentNotification type="info">
              <Text.Body intlMessage={messages.noResults} />
            </ContentNotification>
          )}
          <Switch>
            <SuspendedRoute path={`${match.path}/:productId`}>
              <ProductDetails 
                onClose={() => push(`${match.url}`)} 
              />
            </SuspendedRoute>
          </Switch>
        </Spacings.Stack>
      ) : !productsLoading ? (
        <ContentNotification type="info">
          <Text.Body intlMessage={messages.noResults} />
        </ContentNotification>
      ) : null}
    </Spacings.Stack>
  );
};

ProductsByCategory.displayName = 'ProductsByCategory';
ProductsByCategory.propTypes = {
  linkToWelcome: PropTypes.string.isRequired,
};

export default ProductsByCategory; 