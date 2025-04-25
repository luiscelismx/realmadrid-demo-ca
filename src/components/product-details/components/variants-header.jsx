import PropTypes from 'prop-types';
import Text from '@commercetools-uikit/text';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import { STYLES } from '../constants';
import { formatDate } from '../utils';
import messages from '../messages';

export const VariantsHeader = ({ product, intl }) => {
  return (
    <div style={STYLES.variantsHeader.container}>
      <div>
        <div style={STYLES.metadataPanel.flexRow}>
          <Text.Detail tone="secondary">{intl.formatMessage(messages.fechaCreacion)}:</Text.Detail>
          <Text.Detail>{formatDate(product?.createdAt)}</Text.Detail>
        </div>
      </div>
      <div style={STYLES.variantsHeader.rightAlign}>
        <div style={STYLES.metadataPanel.flexRow}>
          <Text.Detail tone="secondary">{intl.formatMessage(messages.fechaModificacion)}:</Text.Detail>
          <Text.Detail>{formatDate(product?.lastModifiedAt)}</Text.Detail>
        </div>
        <div style={STYLES.variantsHeader.buttonContainer}>
          <SecondaryButton
            label={intl.formatMessage(messages.addVariant)}
            iconLeft={<PlusBoldIcon />}
            onClick={() => {/* Acción para agregar variante */}}
          />
        </div>
      </div>
    </div>
  );
};

VariantsHeader.displayName = 'VariantsHeader';
VariantsHeader.propTypes = {
  product: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
}; 