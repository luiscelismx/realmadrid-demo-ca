import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import DataTable from '@commercetools-uikit/data-table';
import { formatMoney } from '@commercetools-frontend/utils';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import Text from '@commercetools-uikit/text';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import { AngleDownIcon, AngleUpIcon } from '@commercetools-uikit/icons';
import messages from '../messages';
import logger, { LOG_LEVELS } from '../../../helpers/logger';

const COMPONENT_NAME = 'LineItemsTable';

const LineItemsTable = ({ lineItems, isOpen, onToggle }) => {
  const intl = useIntl();
  const { dataLocale } = useApplicationContext();
  
  // Log al renderizar el componente
  logger(COMPONENT_NAME, 'Renderizando componente', LOG_LEVELS.DEBUG, {
    lineItemsCount: lineItems?.length,
    isOpen,
    dataLocale
  });

  // Verificar si hay líneas de pedido para mostrar
  if (!lineItems || lineItems.length === 0) {
    logger(COMPONENT_NAME, 'No hay líneas de pedido para mostrar', LOG_LEVELS.WARN);
    return null;
  }

  const columns = [
    {
      key: 'name',
      label: intl.formatMessage(messages.columnProductName),
      renderItem: (item) => {
        try {
          return (
            <Text.Body>
              {item.name[dataLocale] || Object.values(item.name)[0] || NO_VALUE_FALLBACK}
            </Text.Body>
          );
        } catch (error) {
          logger(COMPONENT_NAME, 'Error al renderizar nombre del producto', LOG_LEVELS.ERROR, {
            itemId: item.id,
            error: error.message
          });
          return <Text.Body>{NO_VALUE_FALLBACK}</Text.Body>;
        }
      },
    },
    {
      key: 'quantity',
      label: intl.formatMessage(messages.columnQuantity),
      renderItem: (item) => <Text.Body>{item.quantity}</Text.Body>,
    },
    {
      key: 'price',
      label: intl.formatMessage(messages.columnPrice),
      renderItem: (item) => {
        try {
          const price = item.price?.value;
          if (!price) {
            logger(COMPONENT_NAME, 'Precio no disponible para el producto', LOG_LEVELS.WARN, { itemId: item.id });
            return <Text.Body>{NO_VALUE_FALLBACK}</Text.Body>;
          }
          return (
            <Text.Body>
              {formatMoney(price.centAmount, price.currencyCode)}
            </Text.Body>
          );
        } catch (error) {
          logger(COMPONENT_NAME, 'Error al formatear precio', LOG_LEVELS.ERROR, {
            itemId: item.id,
            error: error.message
          });
          return <Text.Body>{NO_VALUE_FALLBACK}</Text.Body>;
        }
      },
    },
    {
      key: 'totalPrice',
      label: intl.formatMessage(messages.columnTotalPrice),
      renderItem: (item) => {
        try {
          const totalPrice = item.totalPrice;
          if (!totalPrice) {
            logger(COMPONENT_NAME, 'Precio total no disponible', LOG_LEVELS.WARN, { itemId: item.id });
            return <Text.Body>{NO_VALUE_FALLBACK}</Text.Body>;
          }
          return (
            <Text.Body>
              {formatMoney(totalPrice.centAmount, totalPrice.currencyCode)}
            </Text.Body>
          );
        } catch (error) {
          logger(COMPONENT_NAME, 'Error al formatear precio total', LOG_LEVELS.ERROR, {
            itemId: item.id,
            error: error.message
          });
          return <Text.Body>{NO_VALUE_FALLBACK}</Text.Body>;
        }
      },
    },
  ];

  return (
    <CollapsiblePanel
      header={intl.formatMessage(messages.lineItems)}
      isOpen={isOpen}
      onToggle={() => {
        logger(COMPONENT_NAME, `${isOpen ? 'Cerrando' : 'Abriendo'} tabla de líneas de pedido`, LOG_LEVELS.DEBUG);
        onToggle();
      }}
      renderHeaderIcon={() => isOpen ? <AngleUpIcon /> : <AngleDownIcon />}
      className="line-items-table"
    >
      <DataTable
        rows={lineItems}
        columns={columns}
        maxHeight="500px"
        onRowClick={(item) => {
          logger(COMPONENT_NAME, 'Fila seleccionada', LOG_LEVELS.INFO, {
            itemId: item.id,
            productName: item.name[dataLocale] || Object.values(item.name)[0]
          });
        }}
      />
    </CollapsiblePanel>
  );
};

LineItemsTable.displayName = 'LineItemsTable';
LineItemsTable.propTypes = {
  lineItems: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default LineItemsTable; 