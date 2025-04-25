import PropTypes from 'prop-types';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import TextField from '@commercetools-uikit/text-field';
import Grid from '@commercetools-uikit/grid';
import { CollapsibleSection } from './collapsible-section';
import { formatAttributeValue, getAttributeDisplayName } from '../utils';
import messages from '../messages';

export const AttributesSection = ({
  sortedAttributes,
  isOpen,
  onToggle,
  intl
}) => {
  return (
    <CollapsibleSection 
      title={intl.formatMessage(messages.atributosProducto)}
      isOpen={isOpen} 
      onToggle={onToggle}
    >
      {sortedAttributes && sortedAttributes.length > 0 ? (
        <Grid
          gridGap="16px"
          gridTemplateColumns="1fr 1fr"
        >
          {/* Columna izquierda */}
          <Spacings.Stack scale="m">
            {sortedAttributes
              .filter((_, index) => index % 2 === 0)
              .map((attribute) => (
                <TextField
                  key={attribute.name || `attr-${Math.random()}`}
                  title={getAttributeDisplayName(attribute.name)}
                  value={formatAttributeValue(attribute.value)}
                  isReadOnly
                  horizontalConstraint="scale"
                />
              ))}
          </Spacings.Stack>
          
          {/* Columna derecha */}
          <Spacings.Stack scale="m">
            {sortedAttributes
              .filter((_, index) => index % 2 === 1)
              .map((attribute) => (
                <TextField
                  key={attribute.name || `attr-${Math.random()}`}
                  title={getAttributeDisplayName(attribute.name)}
                  value={formatAttributeValue(attribute.value)}
                  isReadOnly
                  horizontalConstraint="scale"
                />
              ))}
          </Spacings.Stack>
        </Grid>
      ) : (
        <Text.Body>No hay atributos disponibles para este producto.</Text.Body>
      )}
    </CollapsibleSection>
  );
};

AttributesSection.displayName = 'AttributesSection';
AttributesSection.propTypes = {
  sortedAttributes: PropTypes.array,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
}; 