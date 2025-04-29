import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useMemo, useEffect } from 'react';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import Card from '@commercetools-uikit/card';
import DataTable from '@commercetools-uikit/data-table';
import { formatPrice } from './formatter-utils';
import messages from '../messages';
import logger from '../../../helpers/logger';

const COMPONENT_NAME = 'OrderItemsSection';

// Versión optimizada del componente
const OrderItemsSection = ({ lineItems }) => {
  const intl = useIntl();

  useEffect(() => {
    logger.debug(COMPONENT_NAME, 'Componente OrderItemsSection montado');
    
    if (!lineItems || lineItems.length === 0) {
      logger.warn(COMPONENT_NAME, 'No hay líneas de pedido para mostrar');
    } else {
      logger.info(COMPONENT_NAME, `Renderizando ${lineItems.length} líneas de pedido`);
    }
    
    return () => {
      logger.debug(COMPONENT_NAME, 'Componente OrderItemsSection desmontado');
    };
  }, [lineItems]);

  // Columnas para la tabla de productos del pedido - memoizado
  const itemColumns = useMemo(() => {
    logger.debug(COMPONENT_NAME, 'Generando columnas de la tabla');
    return [
      { key: 'name', label: intl.formatMessage(messages.itemName) },
      { key: 'sku', label: intl.formatMessage(messages.sku) },
      { key: 'quantity', label: intl.formatMessage(messages.quantity) },
      { key: 'price', label: intl.formatMessage(messages.unitPrice) },
      { key: 'totalPrice', label: intl.formatMessage(messages.totalItemPrice) },
    ];
  }, [intl]);

  // Renderizador para la tabla de productos - memoizado
  const itemRenderer = useMemo(() => (item, column) => {
    try {
      switch (column.key) {
        case 'name':
          if (!item.name) {
            logger.warn(COMPONENT_NAME, `Item sin nombre: ${item.id || 'ID desconocido'}`);
          }
          return item.name || '-';
        case 'sku':
          if (!item.variant?.sku) {
            logger.warn(COMPONENT_NAME, `Item sin SKU: ${item.id || 'ID desconocido'}`);
          }
          return item.variant?.sku || '-';
        case 'quantity':
          return item.quantity || 0;
        case 'price':
          if (!item.price?.value) {
            logger.warn(COMPONENT_NAME, `Item sin precio unitario: ${item.id || 'ID desconocido'}`);
          }
          return item.price?.value ? formatPrice(item.price.value) : '-';
        case 'totalPrice':
          if (!item.totalPrice) {
            logger.warn(COMPONENT_NAME, `Item sin precio total: ${item.id || 'ID desconocido'}`);
          }
          return item.totalPrice ? formatPrice(item.totalPrice) : '-';
        default:
          return item[column.key] || '-';
      }
    } catch (error) {
      logger.error(COMPONENT_NAME, `Error al renderizar item: ${error.message}`);
      return '-';
    }
  }, []);

  return (
    <Card>
      <Spacings.Stack scale="m">
        <Text.Subheadline as="h4">
          {intl.formatMessage(messages.orderItems)}
        </Text.Subheadline>
        <DataTable
          columns={itemColumns}
          rows={lineItems || []}
          itemRenderer={itemRenderer}
          onRowClick={(item) => {
            logger.debug(COMPONENT_NAME, `Fila seleccionada: ${item.id}`);
          }}
        />
      </Spacings.Stack>
    </Card>
  );
};

OrderItemsSection.displayName = 'OrderItemsSection';
OrderItemsSection.propTypes = {
  lineItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      variant: PropTypes.shape({
        sku: PropTypes.string,
      }),
      quantity: PropTypes.number,
      price: PropTypes.shape({
        value: PropTypes.shape({
          currencyCode: PropTypes.string,
          centAmount: PropTypes.number,
        }),
      }),
      totalPrice: PropTypes.shape({
        currencyCode: PropTypes.string,
        centAmount: PropTypes.number,
      }),
    })
  ).isRequired,
};

export default OrderItemsSection; 