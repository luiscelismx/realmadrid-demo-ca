import PropTypes from 'prop-types';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import Tag from '@commercetools-uikit/tag';
import { formatLocalizedString, transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { STYLES } from '../constants';
import { CollapsibleSection } from './collapsible-section';
import messages from '../messages';

export const CategoriesSection = ({
  categories,
  dataLocale,
  projectLanguages,
  isOpen,
  onToggle,
  intl
}) => {
  const categoryCount = categories?.length || 0;
  
  return (
    <CollapsibleSection 
      title={intl.formatMessage(messages.categorias)}
      isOpen={isOpen} 
      onToggle={onToggle}
      count={categoryCount}
    >
      {categories && categories.length > 0 ? (
        <div style={STYLES.categories.container}>
          <Spacings.Inline scale="s" alignItems="center" flexWrap="wrap">
            {categories.map((category) => (
              <Tag key={category.id || `cat-${Math.random()}`} type="normal">
                {formatLocalizedString(
                  { name: transformLocalizedFieldToLocalizedString(category.nameAllLocales || []) },
                  {
                    key: 'name',
                    locale: dataLocale,
                    fallbackOrder: projectLanguages,
                    fallback: category.id || '',
                  }
                )}
              </Tag>
            ))}
          </Spacings.Inline>
        </div>
      ) : (
        <Text.Body>No hay categorías asignadas a este producto.</Text.Body>
      )}
    </CollapsibleSection>
  );
};

CategoriesSection.displayName = 'CategoriesSection';
CategoriesSection.propTypes = {
  categories: PropTypes.array,
  dataLocale: PropTypes.string.isRequired,
  projectLanguages: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
}; 