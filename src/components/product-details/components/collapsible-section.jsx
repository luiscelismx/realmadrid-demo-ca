import PropTypes from 'prop-types';
import { memo } from 'react';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import { AngleDownIcon, AngleRightIcon } from '@commercetools-uikit/icons';
import { STYLES } from '../constants';

/**
 * Componente para sección colapsable
 */
export const CollapsibleSection = memo(({ title, isOpen, onToggle, children, count }) => {
  return (
    <div style={STYLES.collapsibleSection.container}>
      <Spacings.Stack scale="s">
        <div 
          style={STYLES.collapsibleSection.header} 
          onClick={onToggle}
        >
          {isOpen ? (
            <AngleDownIcon size="medium" color="primary" />
          ) : (
            <AngleRightIcon size="medium" color="primary" />
          )}
          <Text.Headline as="h3" style={{ marginLeft: '8px' }}>
            {title} {count !== undefined && count >= 0 ? `(${count})` : ''}
          </Text.Headline>
        </div>
        {isOpen && (
          <Spacings.Stack scale="l" style={STYLES.collapsibleSection.content}>
            {children}
          </Spacings.Stack>
        )}
      </Spacings.Stack>
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimización para evitar re-renders innecesarios
  return prevProps.isOpen === nextProps.isOpen && 
         prevProps.title === nextProps.title && 
         prevProps.count === nextProps.count;
});

CollapsibleSection.displayName = 'CollapsibleSection';
CollapsibleSection.propTypes = {
  title: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  count: PropTypes.number,
}; 