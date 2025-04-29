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
import messages from './messages';
import { useOrdersFetcher } from '../../hooks/use-orders-connector';
import { useChannelsFetcher } from '../../hooks/use-channels-connector';
import { getErrorMessage } from '../../helpers';
import OrderDetails from '../order-details';
import { useState, useCallback, useEffect } from 'react';

// Definición de las columnas para la tabla de pedidos
const columns = [
  { key: 'orderNumber', label: 'Número de pedido', isSortable: true },
  { key: 'customerEmail', label: 'Email del cliente' },
  { key: 'orderState', label: 'Estado del pedido' },
  { key: 'totalPrice', label: 'Total' },
  { key: 'createdAt', label: 'Fecha de creación', isSortable: true },
  { key: 'lastModifiedAt', label: 'Última modificación' },
];

// Función para renderizar las celdas de la tabla
const itemRenderer = (item, column) => {
  switch (column.key) {
    case 'orderNumber':
      return item.orderNumber || '-';
    case 'customerEmail':
      return item.customerEmail || '-';
    case 'orderState':
      return item.orderState || '-';
    case 'totalPrice':
      if (!item.totalPrice) return '-';
      try {
        return `${item.totalPrice.currencyCode} ${item.totalPrice.centAmount / 100}`;
      } catch (error) {
        console.error('Error al formatear precio:', error);
        return '-';
      }
    case 'createdAt':
      try {
        return new Date(item.createdAt).toLocaleString();
      } catch (error) {
        console.error('Error al formatear fecha:', error);
        return item.createdAt || '-';
      }
    case 'lastModifiedAt':
      try {
        return new Date(item.lastModifiedAt).toLocaleString();
      } catch (error) {
        console.error('Error al formatear fecha:', error);
        return item.lastModifiedAt || '-';
      }
    default:
      return item[column.key] || '-';
  }
};

// Función para obtener el nombre localizado de un canal
const getLocalizedChannelName = (channel, locale = 'es') => {
  if (!channel.nameAllLocales || !Array.isArray(channel.nameAllLocales) || channel.nameAllLocales.length === 0) {
    return channel.key || `Canal ${channel.id.substring(0, 8)}...`;
  }
  
  // Intentar encontrar la localización preferida
  const localizedName = channel.nameAllLocales.find(
    (localization) => localization.locale === locale
  );
  
  // Si se encuentra, usar ese valor
  if (localizedName && localizedName.value) {
    return localizedName.value;
  }
  
  // Si no se encuentra, usar el primer valor disponible
  if (channel.nameAllLocales[0].value) {
    return channel.nameAllLocales[0].value;
  }
  
  // Si no hay valores, usar una alternativa
  return channel.key || `Canal ${channel.id.substring(0, 8)}...`;
};

const Orders = (props) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'createdAt', order: 'desc' });
  
  // Estado para el canal seleccionado
  const [selectedChannel, setSelectedChannel] = useState('all');

  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
  }));

  // Obtener los pedidos con el filtro de canal aplicado en la consulta GraphQL
  const { 
    ordersPaginatedResult, 
    error: ordersError, 
    loading: ordersLoading 
  } = useOrdersFetcher({
    page: page.value,
    perPage: perPage.value,
    tableSorting,
    channelId: selectedChannel, // Pasar el canal seleccionado a la consulta
  });
  
  // Obtener los canales disponibles
  const {
    channelsPaginatedResult,
    error: channelsError,
    loading: channelsLoading
  } = useChannelsFetcher({
    page: { value: 1 },
    perPage: { value: 100 },
    tableSorting: { value: { key: 'id', order: 'asc' } },
  });

  // Log para depuración
  useEffect(() => {
    console.log('Estado del cargador de canales:', { 
      loading: channelsLoading, 
      error: channelsError,
      resultado: channelsPaginatedResult,
      totalCanales: channelsPaginatedResult?.results?.length || 0
    });
  }, [channelsLoading, channelsError, channelsPaginatedResult]);

  // Función para manejar cambios en el canal seleccionado
  const handleChannelChange = useCallback((event) => {
    const channelId = event.target.value;
    console.log(`Canal seleccionado cambiado a: ${channelId}`);
    setSelectedChannel(channelId);
  }, []);

  if (ordersError) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(ordersError)}</Text.Body>
      </ContentNotification>
    );
  }
  
  if (channelsError) {
    console.error('Error al cargar canales:', channelsError);
  }

  // Preparar opciones para el combobox usando los canales obtenidos
  const channelOptions = [
    { value: 'all', label: 'Todos los canales' },
    ...(!channelsLoading && channelsPaginatedResult?.results 
      ? channelsPaginatedResult.results.map(channel => ({
          value: channel.id,
          label: getLocalizedChannelName(channel, dataLocale)
        }))
      : [])
  ];
  
  // Usar directamente los resultados de la consulta filtrada
  const orders = ordersPaginatedResult?.results || [];

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

      {/* Selector de canal */}
      <Constraints.Horizontal max={13}>
        <SelectField
          title="Filtrar por canal"
          name="channel-filter"
          value={selectedChannel}
          options={channelOptions}
          onChange={handleChannelChange}
          horizontalConstraint="scale"
          isDisabled={channelsLoading}
        />
      </Constraints.Horizontal>

      {/* Mostrar estado del filtrado */}
      {selectedChannel !== 'all' && (
        <Constraints.Horizontal max={13}>
          <ContentNotification type="info">
            <Text.Body>
              {`Filtrando por canal: ${channelOptions.find(option => option.value === selectedChannel)?.label || selectedChannel}`}
            </Text.Body>
          </ContentNotification>
        </Constraints.Horizontal>
      )}

      {ordersLoading && (
        <Spacings.Stack scale="s" alignItems="center">
          <LoadingSpinner />
          <Text.Body intlMessage={messages.loadingOrders} />
        </Spacings.Stack>
      )}

      {ordersPaginatedResult ? (
        <Spacings.Stack scale="l">
          <DataTable
            isCondensed
            columns={columns}
            rows={orders}
            itemRenderer={itemRenderer}
            sortedBy={tableSorting.value.key}
            sortDirection={tableSorting.value.order}
            onSortChange={tableSorting.onChange}
            onRowClick={(row) => push(`${match.url}/${row.id}`)}
          />
          {orders.length > 0 ? (
            <Pagination
              page={page.value}
              onPageChange={page.onChange}
              perPage={perPage.value}
              onPerPageChange={perPage.onChange}
              totalItems={ordersPaginatedResult.total}
            />
          ) : (
            <ContentNotification type="info">
              <Text.Body>No hay resultados que coincidan con el filtro seleccionado</Text.Body>
            </ContentNotification>
          )}
          <Switch>
            <SuspendedRoute path={`${match.path}/:orderId`}>
              <OrderDetails onClose={() => push(`${match.url}`)} />
            </SuspendedRoute>
          </Switch>
        </Spacings.Stack>
      ) : !ordersLoading ? (
        <ContentNotification type="info">
          <Text.Body intlMessage={messages.noResults} />
        </ContentNotification>
      ) : null}
    </Spacings.Stack>
  );
};

Orders.displayName = 'Orders';
Orders.propTypes = {
  linkToWelcome: PropTypes.string.isRequired,
};

export default Orders; 