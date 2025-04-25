import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Link as RouterLink, useHistory, useRouteMatch, Switch } from 'react-router-dom';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
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
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import messages from './messages';
import { useProductsByStoreFetcher } from '../../hooks/use-products-connector';
import { useStoresFetcher } from '../../hooks/use-stores-connector';
import { getErrorMessage } from '../../helpers';
import { useState, useEffect } from 'react';
import ProductDetails from '../product-details';

const columns = [
  { key: 'name', label: 'Nombre', isSortable: true },
  { key: 'sku', label: 'SKU' },
  { key: 'productType', label: 'Tipo de producto' },
  { key: 'price', label: 'Precio' },
  { key: 'status', label: 'Estado' },
  { key: 'createdAt', label: 'Fecha de creación' },
  { key: 'lastModifiedAt', label: 'Fecha de modificación' },
];

const itemRenderer = (item, column, dataLocale, projectLanguages) => {
  switch (column.key) {
    case 'name':
      return item.masterData.current.nameAllLocales[0]?.value;
/*       return formatLocalizedString(
        { name: item.masterData.current.nameAllLocales?.[0] },
        {
          key: 'value',
          locale: dataLocale,
          fallbackOrder: projectLanguages,
          fallback: NO_VALUE_FALLBACK,
        }
      ); */
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

const Products = (props) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'name', order: 'asc' });
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedProductSelection, setSelectedProductSelection] = useState('');
  const [storeOptions, setStoreOptions] = useState([]);
  
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project.languages,
    user: context.user,
  }));

  // Obtener las tiendas
  const { stores, error: storesError, loading: storesLoading } = useStoresFetcher();

  // Efectos para procesar las tiendas cuando se cargan
  useEffect(() => {
    if (stores && stores.length > 0) {
      const options = stores.map(store => {
        // Verificamos si la tienda tiene selecciones de productos
        const hasProductSelections = store.productSelections && store.productSelections.length > 0;
        
        return {
          value: store.key,
          label: formatLocalizedString(
            { name: transformLocalizedFieldToLocalizedString(store.nameAllLocales) },
            {
              key: 'name',
              locale: dataLocale,
              fallbackOrder: projectLanguages,
              fallback: store.key, // Si no hay nombre localizado, usamos la key
            }
          ),
          // Guardamos el ID de la primera selección de productos si existe
          productSelectionId: hasProductSelections ? store.productSelections[0].productSelection.id : null,
        };
      });
      setStoreOptions(options);
    }
  }, [stores, dataLocale, projectLanguages]);

  // Solo consultamos productos si hay una selección de productos seleccionada
  const { 
    productsPaginatedResult, 
    error: productsError, 
    loading: productsLoading 
  } = useProductsByStoreFetcher({
    productSelectionId: selectedProductSelection,
    page: page.value,
    perPage: perPage.value,
    tableSorting,
  });

  const handleStoreChange = (event) => {
    const storeKey = event.target.value;
    setSelectedStore(storeKey);
    
    // Buscamos la selección de productos correspondiente a la tienda seleccionada
    const selectedStoreOption = storeOptions.find(option => option.value === storeKey);
    if (selectedStoreOption && selectedStoreOption.productSelectionId) {
      setSelectedProductSelection(selectedStoreOption.productSelectionId);
    } else {
      setSelectedProductSelection('');
    }
  };

  const error = storesError || productsError;

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
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

      <Constraints.Horizontal max={13}>
        <ContentNotification type="info">
          <Text.Body intlMessage={messages.demoHint} />
        </ContentNotification>
      </Constraints.Horizontal>

      <Spacings.Stack scale="l">
        <SelectField
          title={intl.formatMessage(messages.storeLabel)}
          name="store"
          value={selectedStore}
          options={storeOptions}
          onChange={handleStoreChange}
          placeholder={intl.formatMessage(messages.selectStore)}
          horizontalConstraint={13}
          isDisabled={storesLoading || storeOptions.length === 0}
        />

        {storesLoading && (
          <Spacings.Stack scale="s" alignItems="center">
            <LoadingSpinner />
            <Text.Body intlMessage={messages.loadingStores} />
          </Spacings.Stack>
        )}

        {storeOptions.length === 0 && !storesLoading && (
          <ContentNotification type="info">
            <Text.Body intlMessage={messages.noStores} />
          </ContentNotification>
        )}
      </Spacings.Stack>

      {productsLoading && (
        <Spacings.Stack scale="s" alignItems="center">
          <LoadingSpinner />
          <Text.Body intlMessage={messages.loadingProducts} />
        </Spacings.Stack>
      )}

      {productsPaginatedResult && selectedProductSelection ? (
        <Spacings.Stack scale="l">
          <DataTable
            isCondensed
            columns={columns}
            rows={productsPaginatedResult.results || []}
            itemRenderer={(item, column) =>
              itemRenderer(item, column, dataLocale, projectLanguages)
            }
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
                storeKey={selectedStore} 
              />
            </SuspendedRoute>
          </Switch>
        </Spacings.Stack>
      ) : selectedStore && !productsLoading ? (
        <ContentNotification type="info">
          <Text.Body intlMessage={messages.noResults} />
        </ContentNotification>
      ) : null}
    </Spacings.Stack>
  );
};

Products.displayName = 'Products';
Products.propTypes = {
  linkToWelcome: PropTypes.string.isRequired,
};

export default Products; 