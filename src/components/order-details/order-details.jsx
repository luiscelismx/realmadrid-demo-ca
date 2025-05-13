import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  PageNotFound,
  FormModalPage,
} from '@commercetools-frontend/application-components';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { ApplicationPageTitle } from '@commercetools-frontend/application-shell';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import SelectField from '@commercetools-uikit/select-field';
import { useOrderDetailsFetcher } from '../../hooks/use-order-details-connector/use-order-details-connector';
import { getErrorMessage } from '../../helpers';
import { useState, useCallback, useEffect } from 'react';
import messages from './messages';
import logger from '../../helpers/logger';

// Importar componentes modulares (solo CustomerInfoSection activo)
//import CustomerInfoSection from './components/customer-info-section';
// import AddressSection from './components/address-section';
import OrderInfoSection from './components/order-info-section';
import OrderItemsSection from './components/order-items-section';

// Componente para logs
const COMPONENT_NAME = 'OrderDetails';

// ID de canal específico para filtrar
const TARGET_CHANNEL_ID = '839dc061-1d45-4cd0-9233-47700ae687a1';

// Estilos para el componente
const STYLES = {
  layout: {
    flexContainer: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    leftColumn: {
      flex: '1 1 60%',
      marginRight: '16px',
    },
    rightColumn: {
      flex: '1 1 35%',
    },
    fullWidth: {
      width: '100%',
    },
  },
};

// Componente principal de detalles del pedido
const OrderDetails = (props) => {
  const intl = useIntl();
  const params = useParams();
  const orderId = params.orderId;
  
  // Estados para secciones colapsables (solo el necesario)
  const [openSections, setOpenSections] = useState({
    customerInfo: true,
  });
  
  // Estado para el canal seleccionado
  const [selectedChannel, setSelectedChannel] = useState('all');
  
  // Función para manejar el toggle de las secciones
  const toggleSection = useCallback((sectionName) => {
    logger.debug(COMPONENT_NAME, `Alternando visibilidad de sección: ${sectionName}`);
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  }, []);

  // Funciones para cada sección específica
  const toggleCustomerInfo = useCallback(() => toggleSection('customerInfo'), [toggleSection]);
  
  logger.info(COMPONENT_NAME, `Inicializando componente con ID de orden: ${orderId}`);
  const { order, error, loading } = useOrderDetailsFetcher(orderId);

  // Función para manejar cambios en el canal seleccionado
  const handleChannelChange = useCallback((event) => {
    const channelId = event.target.value;
    logger.info(COMPONENT_NAME, `Canal seleccionado cambiado a: ${channelId}`);
    setSelectedChannel(channelId);
  }, []);

  // Función para extraer canales únicos de las líneas de productos
  const extractUniqueChannels = useCallback((lineItems) => {
    if (!lineItems || lineItems.length === 0) return [];
    
    const channels = new Map();
    
    // Extraer identificadores de canales de varios lugares posibles
    lineItems.forEach(item => {
      // Canal de la variante con precio con ámbito
      if (item.variant?.scopedPrice?.channel) {
        const channel = item.variant.scopedPrice.channel;
        channels.set(channel.id, {
          id: channel.id,
          name: channel.name || `Canal ${channel.id.substring(0, 8)}...`,
        });
      }
      
      // Canal del precio normal de la variante
      if (item.variant?.price?.channel) {
        const channel = item.variant.price.channel;
        channels.set(channel.id, {
          id: channel.id,
          name: channel.name || `Canal ${channel.id.substring(0, 8)}...`,
        });
      }
      
      // Canal de distribución del artículo
      if (item.distributionChannel) {
        const channel = item.distributionChannel;
        channels.set(channel.id, {
          id: channel.id,
          name: channel.name || `Canal ${channel.id.substring(0, 8)}...`,
        });
      }
    });
    
    return Array.from(channels.values());
  }, []);

  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
        <Text.Body>{intl.formatMessage(messages.loadingOrder)}</Text.Body>
      </Spacings.Stack>
    );
  }

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  if (!order) {
    logger.warn(COMPONENT_NAME, 'Orden no encontrada');
    return <PageNotFound />;
  }

  const orderTitle = `${intl.formatMessage(messages.orderNumber)}: ${order.orderNumber || order.id}`;

  // Obtener canales únicos de la orden
  const availableChannels = extractUniqueChannels(order.lineItems || []);
  
  // Preparar opciones para el combobox
  const channelOptions = [
    { value: 'all', label: 'Todos los canales' },
    ...availableChannels.map(channel => ({
      value: channel.id,
      label: channel.name,
    })),
  ];

  // Filtrar las líneas de producto según el canal seleccionado
  const filteredLineItems = order.lineItems?.filter(item => {
    // Si se selecciona "Todos los canales", mostrar todos
    if (selectedChannel === 'all') return true;
    
    // Comprobar si coincide con el canal seleccionado
    return (
      item.variant?.scopedPrice?.channel?.id === selectedChannel ||
      item.variant?.price?.channel?.id === selectedChannel ||
      item.distributionChannel?.id === selectedChannel
    );
  }) || [];
  
  logger.info(COMPONENT_NAME, `Líneas filtradas por canal "${selectedChannel}": ${filteredLineItems.length} de ${order.lineItems?.length || 0}`);

  return (
    <FormModalPage
      title={orderTitle}
      isOpen
      onClose={props.onClose}
      hideControls={true}
    >
      <ApplicationPageTitle additionalParts={[orderTitle]} />
      
      <Spacings.Stack scale="l">
        <Text.Headline as="h2">
          {orderTitle}
        </Text.Headline>
        
        {/* Selector de canal */}
        <SelectField
          title="Filtrar por canal"
          name="channel-filter"
          value={selectedChannel}
          options={channelOptions}
          onChange={handleChannelChange}
          horizontalConstraint={13}
        />
        
        {/* Primera sección activa */}
        <OrderInfoSection order={order} />

        <OrderItemsSection lineItems={filteredLineItems} />

        
        {/* Contenido comentado para depuración */}
        {/* Pestañas de navegación */}
        {/* <Spacings.Inline scale="s">
          <SecondaryButton
            onClick={() => handleTabChange('general')}
            isActive={activeTab === 'general'}
            label={intl.formatMessage(messages.generalTab)}
          />
          <SecondaryButton
            onClick={() => handleTabChange('items')}
            isActive={activeTab === 'items'}
            label={intl.formatMessage(messages.itemsTab)}
          />
        </Spacings.Inline> */}

        {/* Resto de componentes comentados */}
        
        {/* 
        <CustomerInfoSection
          order={order}
          isOpen={openSections.customerInfo}
          onToggle={toggleCustomerInfo}
        />
        <AddressSection
          title={billingAddressTitle}
          address={order.billingAddress}
          isOpen={openSections.billingAddress}
          onToggle={toggleBillingAddress}
        /> */}
      </Spacings.Stack>
    </FormModalPage>
  );
};

OrderDetails.displayName = 'OrderDetails';
OrderDetails.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default OrderDetails; 