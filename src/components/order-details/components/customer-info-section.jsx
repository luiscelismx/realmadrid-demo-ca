import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useEffect } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import Card from '@commercetools-uikit/card';
import Text from '@commercetools-uikit/text';
import { AngleDownIcon, AngleRightIcon } from '@commercetools-uikit/icons';
import LabelValuePair from './label-value-pair';
import messages from '../messages';
import logger from '../../../helpers/logger';

const COMPONENT_NAME = 'CustomerInfoSection';

const CustomerInfoSection = ({ order, isOpen, onToggle }) => {
  const intl = useIntl();

  useEffect(() => {
    logger.debug(COMPONENT_NAME, 'Componente CustomerInfoSection montado');
    
    if (!order) {
      logger.warn(COMPONENT_NAME, 'Intentando renderizar con datos de orden nulos o indefinidos');
      return;
    }
    
    logger.debug(COMPONENT_NAME, 'Información del cliente:', {
      orderID: order.id,
      hasCustomerEmail: !!order.customerEmail,
      hasCustomerId: !!order.customerId
    });
    
    return () => {
      logger.debug(COMPONENT_NAME, 'Componente CustomerInfoSection desmontado');
    };
  }, [order]);

  // Obtener información del cliente desde la dirección de envío o facturación
  const getCustomerName = () => {
    if (order.shippingAddress?.firstName || order.shippingAddress?.lastName) {
      const name = `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim();
      logger.debug(COMPONENT_NAME, `Nombre del cliente obtenido de dirección de envío: ${name}`);
      return name;
    } else if (order.billingAddress?.firstName || order.billingAddress?.lastName) {
      const name = `${order.billingAddress.firstName || ''} ${order.billingAddress.lastName || ''}`.trim();
      logger.debug(COMPONENT_NAME, `Nombre del cliente obtenido de dirección de facturación: ${name}`);
      return name;
    }
    logger.warn(COMPONENT_NAME, 'No se pudo obtener el nombre del cliente de ninguna dirección');
    return null;
  };

  const customerName = getCustomerName();
  const sectionTitle = intl.formatMessage(messages.customerInfo);

  // Verificar si hay información del cliente disponible
  const hasCustomerInfo = Boolean(order?.customerEmail || order?.customerId || customerName);
  
  if (!hasCustomerInfo) {
    logger.warn(COMPONENT_NAME, 'No hay información de cliente disponible para mostrar');
    return null;
  }

  return (
    <Card>
      <div 
        onClick={onToggle} 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        <Text.Subheadline as="h4">{sectionTitle}</Text.Subheadline>
        {isOpen ? <AngleDownIcon /> : <AngleRightIcon />}
      </div>
      
      {isOpen && (
        <Spacings.Stack scale="m">
          {order.customerEmail && (
            <LabelValuePair 
              label={intl.formatMessage(messages.customerEmail)} 
              value={order.customerEmail} 
            />
          )}
          {customerName && (
            <LabelValuePair 
              label={intl.formatMessage(messages.customerName)}
              value={customerName} 
            />
          )}
          {order.customerId && (
            <LabelValuePair 
              label={intl.formatMessage(messages.customerId)}
              value={order.customerId} 
            />
          )}
        </Spacings.Stack>
      )}
    </Card>
  );
};

CustomerInfoSection.displayName = 'CustomerInfoSection';
CustomerInfoSection.propTypes = {
  order: PropTypes.shape({
    customerEmail: PropTypes.string,
    customerId: PropTypes.string,
    shippingAddress: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
    billingAddress: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default CustomerInfoSection; 