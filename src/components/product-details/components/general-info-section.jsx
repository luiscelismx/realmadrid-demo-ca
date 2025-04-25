import PropTypes from 'prop-types';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import TextField from '@commercetools-uikit/text-field';
import { formatLocalizedString, transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { STYLES } from '../constants';
import { CollapsibleSection } from './collapsible-section';
import messages from '../messages';

export const GeneralInfoSection = ({
  product,
  productName,
  dataLocale,
  projectLanguages,
  isOpen,
  onToggle,
  intl
}) => {
  const isPublished = product.masterData?.published || false;
  const hasStagedChanges = product.masterData?.hasStagedChanges || false;

  return (
    <CollapsibleSection 
      title={intl.formatMessage(messages.generalInformation)}
      isOpen={isOpen} 
      onToggle={onToggle}
    >
      {/* Nombre del producto */}
      <TextField
        title="Product name"
        value={productName}
        isReadOnly
        horizontalConstraint="scale"
      />
      
      {/* Información básica */}
      <Spacings.Stack scale="l">
        <TextField
          title="Product key"
          value={product.key || '-'}
          isReadOnly
          horizontalConstraint="scale"
        />
        
        <TextField
          title="Estado de publicación"
          value={isPublished ? 'Publicado' : 'No publicado'}
          isReadOnly
          horizontalConstraint="scale"
        />
        
        {hasStagedChanges && (
          <TextField
            title="Cambios pendientes"
            value="Sí"
            isReadOnly
            horizontalConstraint="scale"
          />
        )}
        
        {product.taxCategory && (
          <TextField
            title="Categoría de impuestos"
            value={product.taxCategory.name}
            isReadOnly
            horizontalConstraint="scale"
          />
        )}
        
        {product.masterData?.current?.masterVariant?.sku && (
          <TextField
            title="SKU principal"
            value={product.masterData.current.masterVariant.sku}
            isReadOnly
            horizontalConstraint="scale"
          />
        )}
      </Spacings.Stack>
      
      {/* Descripción del producto */}
      {product.masterData?.current?.descriptionAllLocales && 
        product.masterData.current.descriptionAllLocales.length > 0 && (
        <Spacings.Stack scale="m" style={STYLES.description.container}>
          <Text.Subheadline as="h4" isBold>Descripción</Text.Subheadline>
          <TextField
            value={formatLocalizedString(
              { description: transformLocalizedFieldToLocalizedString(product.masterData.current.descriptionAllLocales || []) },
              {
                key: 'description',
                locale: dataLocale,
                fallbackOrder: projectLanguages,
                fallback: '',
              }
            )}
            isReadOnly
            isMultiline
            horizontalConstraint="scale"
          />
        </Spacings.Stack>
      )}
    </CollapsibleSection>
  );
};

GeneralInfoSection.displayName = 'GeneralInfoSection';
GeneralInfoSection.propTypes = {
  product: PropTypes.object.isRequired,
  productName: PropTypes.string.isRequired,
  dataLocale: PropTypes.string.isRequired,
  projectLanguages: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
}; 