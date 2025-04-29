import PropTypes from 'prop-types';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';

// Componente para mostrar etiqueta y valor de un campo
const LabelValuePair = ({ label, value }) => (
  <Spacings.Inline justifyContent="space-between" alignItems="center">
    <Text.Body fontWeight="bold">{label}:</Text.Body>
    <Text.Body>{value || '-'}</Text.Body>
  </Spacings.Inline>
);

LabelValuePair.displayName = 'LabelValuePair';
LabelValuePair.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
};

export default LabelValuePair; 