import PropTypes from 'prop-types';
import { memo } from 'react';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import { STYLES } from '../constants';
import { formatDate } from '../utils';
import messages from '../messages';

/**
 * Componente para el panel de metadatos
 */
export const MetadataPanel = memo(({ product, intl }) => {
  if (!product) return null;
  
  return (
    <div style={STYLES.metadataPanel.container}>
      <Spacings.Stack scale="s">
        <div style={STYLES.metadataPanel.flexRow}>
          <Text.Detail tone="secondary">{intl.formatMessage(messages.fechaCreacion)}:</Text.Detail>
          <Text.Detail>{formatDate(product?.createdAt)}</Text.Detail>
        </div>
        <div style={STYLES.metadataPanel.flexRow}>
          <Text.Detail tone="secondary">{intl.formatMessage(messages.fechaModificacion)}:</Text.Detail>
          <Text.Detail>{formatDate(product?.lastModifiedAt)}</Text.Detail>
        </div>
        <div style={STYLES.metadataPanel.flexRow}>
          <Text.Detail tone="secondary">{intl.formatMessage(messages.tipoProducto)}:</Text.Detail>
          <Text.Detail>{product?.productType?.name || '-'}</Text.Detail>
        </div>
      </Spacings.Stack>
    </div>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si cambia el producto o el intl
  return prevProps.product?.id === nextProps.product?.id &&
         prevProps.product?.lastModifiedAt === nextProps.product?.lastModifiedAt &&
         prevProps.intl === nextProps.intl;
});

MetadataPanel.displayName = 'MetadataPanel';
MetadataPanel.propTypes = {
  product: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
}; 