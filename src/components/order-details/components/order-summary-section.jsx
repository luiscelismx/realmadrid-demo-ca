import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import Card from '@commercetools-uikit/card';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import { AngleDownIcon, AngleUpIcon } from '@commercetools-uikit/icons';
import { formatMoney } from '@commercetools-frontend/utils';
import messages from '../messages';
import logger, { LOG_LEVELS } from '../../../helpers/logger';

const COMPONENT_NAME = 'OrderSummarySection';

const OrderSummarySection = ({ order, isOpen, onToggle }) => {
  const intl = useIntl();
  
  // Log al renderizar el componente
  logger(COMPONENT_NAME, 'Renderizando componente', LOG_LEVELS.DEBUG, {
    orderId: order?.id,
    orderState: order?.orderState,
    totalItems: order?.lineItems?.length,
    isOpen
  });

  // Verificar si el pedido tiene la información necesaria
  if (!order || !order.totalPrice) {
    logger(COMPONENT_NAME, 'Falta información de precio total en el pedido', LOG_LEVELS.WARN);
    return null;
  }

  return (
    <CollapsiblePanel
      header={intl.formatMessage(messages.orderSummary)}
      isOpen={isOpen}
      onToggle={() => {
        logger(COMPONENT_NAME, `${isOpen ? 'Cerrando' : 'Abriendo'} sección de resumen`, LOG_LEVELS.DEBUG);
        onToggle();
      }}
      renderHeaderIcon={() => isOpen ? <AngleUpIcon /> : <AngleDownIcon />}
      className="order-summary-section"
    >
      <Card type="flat" insetScale="s">
        <Spacings.Stack scale="m">
          <Spacings.Inline alignItems="center" justifyContent="space-between">
            <Text.Detail tone="secondary">
              {intl.formatMessage(messages.orderState)}:
            </Text.Detail>
            <Text.Detail>{order.orderState}</Text.Detail>
          </Spacings.Inline>
          
          <Spacings.Inline alignItems="center" justifyContent="space-between">
            <Text.Detail tone="secondary">
              {intl.formatMessage(messages.totalAmount)}:
            </Text.Detail>
            <Text.Detail fontWeight="bold">
              {formatMoney(
                order.totalPrice.centAmount,
                order.totalPrice.currencyCode
              )}
            </Text.Detail>
          </Spacings.Inline>
          
          {order.lineItems && (
            <Spacings.Inline alignItems="center" justifyContent="space-between">
              <Text.Detail tone="secondary">
                {intl.formatMessage(messages.numberOfItems)}:
              </Text.Detail>
              <Text.Detail>{order.lineItems.length}</Text.Detail>
            </Spacings.Inline>
          )}
        </Spacings.Stack>
      </Card>
    </CollapsiblePanel>
  );
};

OrderSummarySection.displayName = 'OrderSummarySection';
OrderSummarySection.propTypes = {
  order: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default OrderSummarySection; 