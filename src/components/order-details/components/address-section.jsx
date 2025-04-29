import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useEffect } from 'react';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import Card from '@commercetools-uikit/card';
import { AngleDownIcon, AngleRightIcon } from '@commercetools-uikit/icons';
import LabelValuePair from './label-value-pair';
import { formatAddress } from './formatter-utils';
import messages from '../messages';
import logger from '../../../helpers/logger';

const COMPONENT_NAME = 'AddressSection';

const AddressSection = ({ title, address, isOpen, onToggle }) => {
  const intl = useIntl();
  
  useEffect(() => {
    logger.debug(COMPONENT_NAME, 'Componente AddressSection montado');
    
    if (!address) {
      logger.warn(COMPONENT_NAME, `La dirección para "${title}" no está disponible`);
    } else {
      logger.debug(COMPONENT_NAME, `Dirección de ${title} disponible`, {
        hasStreet: !!address.streetName,
        hasCity: !!address.city,
        hasContact: !!(address.email || address.phone),
      });
    }
    
    return () => {
      logger.debug(COMPONENT_NAME, 'Componente AddressSection desmontado');
    };
  }, [address, title]);
  
  if (!address) {
    logger.debug(COMPONENT_NAME, `Renderizando sección vacía para: ${title}`);
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
        
        {isOpen && (
          <Spacings.Stack scale="m">
            <Text.Body>{intl.formatMessage(messages.addressNotAvailable)}</Text.Body>
          </Spacings.Stack>
        )}
      </Card>
    );
  }
  
  // Formatear la dirección como texto
  const formattedAddress = formatAddress(address);
  if (!formattedAddress || formattedAddress.trim() === '') {
    logger.warn(COMPONENT_NAME, 'La dirección no pudo ser formateada correctamente');
  }
  
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
      
      {isOpen && (
        <Spacings.Stack scale="m">
          <Text.Body>{formattedAddress}</Text.Body>
          {address?.email && (
            <LabelValuePair 
              label={intl.formatMessage(messages.email)} 
              value={address.email} 
            />
          )}
          {address?.phone && (
            <LabelValuePair 
              label={intl.formatMessage(messages.phone)}
              value={address.phone} 
            />
          )}
        </Spacings.Stack>
      )}
    </Card>
  );
};

AddressSection.displayName = 'AddressSection';
AddressSection.propTypes = {
  title: PropTypes.string.isRequired,
  address: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    streetName: PropTypes.string,
    streetNumber: PropTypes.string,
    city: PropTypes.string,
    postalCode: PropTypes.string,
    country: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
  }),
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default AddressSection; 