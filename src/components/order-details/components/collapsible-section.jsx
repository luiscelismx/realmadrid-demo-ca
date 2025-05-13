import PropTypes from 'prop-types';
import { AngleDownIcon, AngleRightIcon } from '@commercetools-uikit/icons';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import Card from '@commercetools-uikit/card';

// Componente para secciones colapsables - versión simple para depuración
const CollapsibleSection = (props) => {
  const { title, children, isOpen, onToggle } = props;
  
  return (
    <Card>
      <div 
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        <Text.Subheadline as="h4">{title}</Text.Subheadline>
        {isOpen ? <AngleDownIcon /> : <AngleRightIcon />}
      </div>
      {isOpen && <Spacings.Stack scale="m">{children}</Spacings.Stack>}
    </Card>
  );
};

CollapsibleSection.displayName = 'CollapsibleSection';
CollapsibleSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default CollapsibleSection; 