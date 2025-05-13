import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useEffect } from 'react';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import Card from '@commercetools-uikit/card';
import LabelValuePair from './label-value-pair';
import { formatPrice, formatDate } from './formatter-utils';
import messages from '../messages';
import logger from '../../../helpers/logger';

// Nombre del componente para logs
const COMPONENT_NAME = 'OrderInfoSection';

const OrderInfoSection = ({ order }) => {
  const intl = useIntl();

  useEffect(() => {
    logger.debug(COMPONENT_NAME, 'Componente OrderInfoSection montado');
    
    if (!order) {
      logger.warn(COMPONENT_NAME, 'Intentando renderizar con un pedido nulo o indefinido');
      return;
    }
    
    logger.debug(COMPONENT_NAME, `Información del pedido: ID=${order.id}, Fecha=${order.createdAt}, Estado=${order.orderState}`);
    
    return () => {
      logger.debug(COMPONENT_NAME, 'Componente OrderInfoSection desmontado');
    };
  }, [order]);

  if (!order) {
    logger.error(COMPONENT_NAME, 'Datos del pedido no proporcionados');
    return (
      <Card>
        <Text.Body>
          {intl.formatMessage(messages.orderInfo)} - {intl.formatMessage(messages.noOrderFound)}
        </Text.Body>
      </Card>
    );
  }

  const createdAt = order.createdAt 
    ? formatDate(order.createdAt) 
    : null;
    
  if (!createdAt) {
    logger.warn(COMPONENT_NAME, 'Fecha de creación del pedido no disponible o en formato incorrecto');
  }
  
  logger.info(COMPONENT_NAME, `Renderizando información del pedido ${order.id}`);

  return (
    <Card>
      <Spacings.Stack scale="m">
        <Text.Headline as="h3">
          {intl.formatMessage(messages.orderInfo)}
        </Text.Headline>
        
        <Spacings.Inline justifyContent="space-between">
          <Text.Body isBold>{intl.formatMessage(messages.orderNumber)}</Text.Body>
          <Text.Body>{order.orderNumber || '-'}</Text.Body>
        </Spacings.Inline>

        <Spacings.Inline justifyContent="space-between">
          <Text.Body isBold>{intl.formatMessage(messages.created)}</Text.Body>
          <Text.Body>{createdAt || '-'}</Text.Body>
        </Spacings.Inline>

        <Spacings.Inline justifyContent="space-between">
          <Text.Body isBold>{intl.formatMessage(messages.orderState)}</Text.Body>
          <Text.Body>{order.orderState || '-'}</Text.Body>
        </Spacings.Inline>

        <Spacings.Inline justifyContent="space-between">
          <Text.Body isBold>{intl.formatMessage(messages.paymentState)}</Text.Body>
          <Text.Body>{order.paymentState || '-'}</Text.Body>
        </Spacings.Inline>

        <Spacings.Inline justifyContent="space-between">
          <Text.Body isBold>{intl.formatMessage(messages.shipmentState)}</Text.Body>
          <Text.Body>{order.shipmentState || '-'}</Text.Body>
        </Spacings.Inline>
      </Spacings.Stack>
    </Card>
  );
};

OrderInfoSection.displayName = 'OrderInfoSection';
OrderInfoSection.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.string,
    orderNumber: PropTypes.string,
    createdAt: PropTypes.string,
    orderState: PropTypes.string,
    paymentState: PropTypes.string,
    shipmentState: PropTypes.string,
  }),
};

export default OrderInfoSection; 