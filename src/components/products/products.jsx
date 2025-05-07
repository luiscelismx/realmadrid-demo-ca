import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Link as RouterLink, useHistory, useRouteMatch, Switch } from 'react-router-dom';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { NO_VALUE_FALLBACK, GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import {
  usePaginationState,
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';
import { BackIcon } from '@commercetools-uikit/icons';
import Constraints from '@commercetools-uikit/constraints';
import FlatButton from '@commercetools-uikit/flat-button';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import DataTable from '@commercetools-uikit/data-table';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { Pagination } from '@commercetools-uikit/pagination';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import SelectField from '@commercetools-uikit/select-field';
import Card from '@commercetools-uikit/card';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import messages from './messages';
import { useProductsByStoreFetcher } from '../../hooks/use-products-connector';
import { useStoresFetcher } from '../../hooks/use-stores-connector';
import { getErrorMessage } from '../../helpers';
import { useState, useEffect } from 'react';
import ProductDetails from '../product-details';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useChannelsFetcher } from '../../hooks/use-channels-connector';

// Utilidad para obtener el nombre de un canal
const getChannelName = (channel) => {
  if (!channel) return 'Desconocido';
  
  if (channel.nameAllLocales && channel.nameAllLocales.length > 0) {
    return channel.nameAllLocales[0].value;
  }
  
  return channel.key || channel.id || 'Sin nombre';
};

const columns = [
  { key: 'name', label: 'Nombre', isSortable: true },
  { key: 'sku', label: 'SKU' },
  { key: 'productType', label: 'Tipo de producto' },
  { key: 'price', label: 'Precio' },
  { key: 'status', label: 'Estado' },
  { key: 'createdAt', label: 'Fecha de creación' },
  { key: 'lastModifiedAt', label: 'Fecha de modificación' },
];

const itemRenderer = (item, column, dataLocale, projectLanguages) => {
  switch (column.key) {
    case 'name':
      return item.masterData.current.nameAllLocales[0]?.value;
/*       return formatLocalizedString(
        { name: item.masterData.current.nameAllLocales?.[0] },
        {
          key: 'value',
          locale: dataLocale,
          fallbackOrder: projectLanguages,
          fallback: NO_VALUE_FALLBACK,
        }
      ); */
    case 'productType':
      return item.productType.name;
    case 'sku':
      return item?.key || '-';
    case 'price':
      const price = item.masterData.current.masterVariant?.prices?.[0]?.value;
      if (!price) return '-';
      return `${price.currencyCode} ${price.centAmount / 100}`;
    case 'lastModifiedAt':
      return item.lastModifiedAt;
    case 'status':
      return item.masterData.published;
    case 'createdAt':
      return item.createdAt;
    default:
      return item[column.key];
  }
};

// GraphQL query para buscar el custom object del usuario por key
const FETCH_USER_BY_KEY = gql`
  query FetchUserByKey($container: String!, $key: String!) {
    customObject(
      container: $container
      key: $key
    ) {
      id
      key
      value
    }
  }
`;

// GraphQL query para obtener el canal por ID
const FETCH_CHANNEL_BY_ID = gql`
  query FetchChannelById($id: String!) {
    channel(id: $id) {
      id
      key
      roles
      nameAllLocales {
        locale
        value
      }
    }
  }
`;

const Products = (props) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'name', order: 'asc' });
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedDistributionChannel, setSelectedDistributionChannel] = useState('');
  const [storeOptions, setStoreOptions] = useState([]);
  const [userLoaded, setUserLoaded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const { dataLocale, projectLanguages, user } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project.languages,
    user: context.user,
  }));

  // Obtener el ID del usuario del contexto
  const userId = user?.id;
  console.log('ID del usuario actual:', userId);

  // Consultar el custom object del usuario por key (que es el ID del usuario)
  const { 
    data: userData, 
    loading: userLoading, 
    error: userError 
  } = useQuery(FETCH_USER_BY_KEY, {
    variables: {
      container: "app-users",
      key: userId,
    },
    skip: !userId,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  // Obtener las tiendas
  const { stores, error: storesError, loading: storesLoading } = useStoresFetcher();
  
  // Obtener todos los canales
  const { 
    channelsPaginatedResult, 
    error: channelsError, 
    loading: channelsLoading 
  } = useChannelsFetcher({
    page: { value: 1 },
    perPage: { value: 500 }, // Obtener varios canales para asegurar que tenemos todos
    tableSorting: { value: { key: 'key', order: 'asc' } },
  });

  // Efectos para procesar las tiendas cuando se cargan
  useEffect(() => {
    if (stores && stores.length > 0) {
      const options = stores.map(store => {
        // Verificamos si la tienda tiene canales de distribución
        const hasDistributionChannels = store.distributionChannels && store.distributionChannels.length > 0;
        
        return {
          value: store.key,
          label: formatLocalizedString(
            { name: transformLocalizedFieldToLocalizedString(store.nameAllLocales) },
            {
              key: 'name',
              locale: dataLocale,
              fallbackOrder: projectLanguages,
              fallback: store.key, // Si no hay nombre localizado, usamos la key
            }
          ),
          // Guardamos el ID del primer canal de distribución si existe
          distributionChannelId: hasDistributionChannels ? store.distributionChannels[0].id : null,
        };
      });
      setStoreOptions(options);
    }
  }, [stores, dataLocale, projectLanguages]);

  // Efecto para seleccionar automáticamente el store del usuario cuando se carga
  useEffect(() => {
    if (!userLoaded && userData && !userLoading && storeOptions.length > 0 && stores && stores.length > 0 && channelsPaginatedResult) {
      try {
        const userCustomObject = userData.customObject;
        
        if (userCustomObject) {
          console.log('Usuario encontrado:', userCustomObject);
          
          // Parsear el value si es string
          const userValue = typeof userCustomObject.value === 'string' 
            ? JSON.parse(userCustomObject.value) 
            : userCustomObject.value;
          
          // Obtener providerIds (canales) del usuario
          const providerIds = Array.isArray(userValue.providerIds) ? userValue.providerIds : [];
          console.log('Provider IDs del usuario:', providerIds);
          
          if (providerIds.length > 0) {
            const channelId = providerIds[0]; // Tomamos el primer canal asignado
            console.log('Channel ID seleccionado del usuario:', channelId);
            
            // Buscar el canal con el ID en la lista de canales que ya obtuvimos
            const channelMatch = channelsPaginatedResult.results.find(channel => channel.id === channelId);
            
            if (channelMatch) {
              const channelKey = channelMatch.key;
              console.log('Canal encontrado:', channelMatch);
              console.log('Channel KEY para buscar en tiendas:', channelKey);
              console.log('Channel ID para buscar en tiendas:', channelId);
              
              // Buscar el store que tenga este channelId en sus distributionChannels o supplyChannels
              console.log('Tiendas disponibles:', stores);
              
              const storeMatch = stores.find(store => {
                // Verificar en distributionChannels
                const hasInDistribution = store.distributionChannels && 
                  Array.isArray(store.distributionChannels) && 
                  store.distributionChannels.some(channel => channel && channel.id === channelId);
                
                // Verificar en supplyChannels
                const hasInSupply = store.supplyChannels && 
                  Array.isArray(store.supplyChannels) && 
                  store.supplyChannels.some(channel => channel && channel.id === channelId);
                
                // Debugging
                if (hasInDistribution || hasInSupply) {
                  console.log('¡Encontrado match en tienda!', {
                    storeKey: store.key,
                    inDistributionChannels: hasInDistribution,
                    inSupplyChannels: hasInSupply,
                    channelId
                  });
                }
                
                return hasInDistribution || hasInSupply;
              });
              
              if (storeMatch) {
                console.log('Store seleccionado para el usuario por canal ID:', storeMatch.key);
                
                // Buscar los canales de distribución de la tienda seleccionada
                if (storeMatch.distributionChannels && storeMatch.distributionChannels.length > 0) {
                  const distributionChannelId = storeMatch.distributionChannels[0].id;
                  console.log('Con distributionChannelId:', distributionChannelId);
                  setSelectedStore(storeMatch.key);
                  setSelectedDistributionChannel(distributionChannelId);
                } else {
                  console.warn('No se encontraron distributionChannels para la tienda:', storeMatch.key);
                  setSelectedStore(storeMatch.key);
                }
              } else {
                console.warn('No se encontró un store para el Channel ID:', channelId);
                selectFirstAvailableStore();
              }
            } else {
              console.warn('No se encontró el canal con ID:', channelId);
              // Fallback a usar la primera tienda disponible
              selectFirstAvailableStore();
            }
            
            // Función para seleccionar la primera tienda disponible
            function selectFirstAvailableStore() {
              console.log('Seleccionando primera tienda disponible como fallback');
              
              // Mostrar las tiendas disponibles para depuración
              console.log('Tiendas disponibles:', stores.map(store => ({
                key: store.key,
                name: store.nameAllLocales?.[0]?.value || store.key
              })));
              
              if (stores.length > 0) {
                const firstStore = stores[0];
                console.log('Primera tienda disponible:', firstStore.key);
                
                // Buscar la selección de productos correspondiente
                const storeOption = storeOptions.find(option => option.value === firstStore.key);
                if (storeOption && storeOption.distributionChannelId) {
                  console.log('Con distributionChannelId:', storeOption.distributionChannelId);
                  setSelectedStore(firstStore.key);
                  setSelectedDistributionChannel(storeOption.distributionChannelId);
                } else {
                  console.warn('No se encontró distributionChannelId para la tienda:', firstStore.key);
                  setSelectedStore(firstStore.key);
                }
              } else {
                console.warn('No hay tiendas disponibles');
              }
            }
          } else {
            console.warn('El usuario no tiene canales asignados');
            // Seleccionar la primera tienda como fallback
            if (storeOptions.length > 0) {
              const firstStore = storeOptions[0];
              console.log('Seleccionando primera tienda disponible (fallback):', firstStore.value);
              setSelectedStore(firstStore.value);
              setSelectedDistributionChannel(firstStore.distributionChannelId || '');
            }
          }
        } else {
          console.warn('No se encontró el custom object del usuario');
          // Seleccionar la primera tienda como fallback
          if (storeOptions.length > 0) {
            const firstStore = storeOptions[0];
            console.log('Seleccionando primera tienda disponible (fallback):', firstStore.value);
            setSelectedStore(firstStore.value);
            setSelectedDistributionChannel(firstStore.distributionChannelId || '');
          }
        }
      } catch (error) {
        console.error('Error al procesar datos del usuario:', error);
        // Intentar seleccionar la primera tienda en caso de error
        if (storeOptions.length > 0) {
          const firstStore = storeOptions[0];
          console.log('Seleccionando primera tienda disponible (error fallback):', firstStore.value);
          setSelectedStore(firstStore.value);
          setSelectedDistributionChannel(firstStore.distributionChannelId || '');
        }
      } finally {
        setUserLoaded(true);
      }
    }
  }, [userData, userLoading, storeOptions, stores, userLoaded, channelsPaginatedResult]);

  // Solo consultamos productos si hay un canal de distribución seleccionado
  const { 
    productsPaginatedResult, 
    error: productsError, 
    loading: productsLoading 
  } = useProductsByStoreFetcher({
    distributionChannelId: selectedDistributionChannel,
    page: page.value,
    perPage: perPage.value,
    tableSorting,
  });

  // Efecto para marcar cuando la carga inicial se ha completado
  useEffect(() => {
    if (userLoaded && selectedStore && (productsPaginatedResult || !selectedDistributionChannel)) {
      setInitialLoadComplete(true);
    }
  }, [userLoaded, selectedStore, selectedDistributionChannel, productsPaginatedResult]);

  const handleStoreChange = (event) => {
    const storeKey = event.target.value;
    setSelectedStore(storeKey);
    
    // Buscamos el canal de distribución correspondiente a la tienda seleccionada
    const selectedStoreOption = storeOptions.find(option => option.value === storeKey);
    if (selectedStoreOption && selectedStoreOption.distributionChannelId) {
      setSelectedDistributionChannel(selectedStoreOption.distributionChannelId);
    } else {
      setSelectedDistributionChannel('');
    }
  };

  const error = storesError || productsError || userError || channelsError;

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  // Mostrar spinner mientras se cargan los datos para la experiencia inicial
  if (!initialLoadComplete && (userLoading || (selectedDistributionChannel && productsLoading) || (!userLoaded && userData))) {
    const loadingMessage = userLoading 
      ? "Cargando información del usuario..."
      : selectedDistributionChannel && productsLoading
        ? `Cargando productos de la tienda ${selectedStore}...`
        : "Configurando tienda según permisos del usuario...";
    
    return (
      <Spacings.Stack scale="s" alignItems="center">
        <LoadingSpinner />
        <Text.Body>{loadingMessage}</Text.Body>
      </Spacings.Stack>
    );
  }

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Stack scale="xs">
        <FlatButton
          as={RouterLink}
          to={props.linkToWelcome}
          label={intl.formatMessage(messages.backToWelcome)}
          icon={<BackIcon />}
        />
        <Text.Headline as="h2" intlMessage={messages.title} />
      </Spacings.Stack>

      <Constraints.Horizontal max={13}>
        <ContentNotification type="info">
          <Text.Body intlMessage={messages.demoHint} />
        </ContentNotification>
      </Constraints.Horizontal>

      {userData && userData.customObject && (
        <Spacings.Stack scale="m">
          <Card>
            <Spacings.Stack scale="m">
              <Text.Headline as="h3">Información del Usuario</Text.Headline>
              <Spacings.Stack scale="s">
                <Text.Body>
                  <strong>ID:</strong> {userId || 'No disponible'}
                </Text.Body>
                {(() => {
                  try {
                    const userObject = userData.customObject;
                    const userValue = typeof userObject.value === 'string' 
                      ? JSON.parse(userObject.value) 
                      : userObject.value;
                    
                    const providerIds = Array.isArray(userValue.providerIds) ? userValue.providerIds : [];
                    // Variable para almacenar los canales disponibles
                    const channels = [];
                    
                    // Intentar encontrar la información de los canales del usuario
                    const userChannels = providerIds.map(channelId => {
                      // Buscar el canal en los stores disponibles
                      let channelInfo = { id: channelId, name: 'Desconocido' };
                      
                      // También buscar en channelsPaginatedResult si está disponible
                      if (channelsPaginatedResult && channelsPaginatedResult.results) {
                        const matchedChannel = channelsPaginatedResult.results.find(ch => ch.id === channelId);
                        if (matchedChannel) {
                          channelInfo = { 
                            ...channelInfo,
                            ...matchedChannel,
                            fromCatalog: true
                          };
                        }
                      }
                      
                      // Buscar en las tiendas como respaldo
                      for (const store of stores || []) {
                        if (store.channels && Array.isArray(store.channels)) {
                          const foundChannel = store.channels.find(ch => ch && ch.id === channelId);
                          if (foundChannel) {
                            channelInfo = { 
                              ...channelInfo,
                              ...foundChannel,
                              storeName: store.nameAllLocales?.[0]?.value || store.key,
                              storeKey: store.key
                            };
                            break;
                          }
                        }
                      }
                      
                      return channelInfo;
                    });
                    
                    return (
                      <>
                        <Text.Body>
                          <strong>Email:</strong> {userValue.email || 'No disponible'}
                        </Text.Body>
                        <Text.Body>
                          <strong>Nombre:</strong> {userValue.name || 'No disponible'}
                        </Text.Body>
                        <Text.Body>
                          <strong>Roles:</strong> {Array.isArray(userValue.roles) ? userValue.roles.join(', ') : 'No disponible'}
                        </Text.Body>
                        <Text.Body>
                          <strong>providerIds (Channel IDs):</strong> {providerIds.length > 0 ? providerIds.join(', ') : 'Ninguno'}
                        </Text.Body>
                        
                        {userChannels.length > 0 && (
                          <>
                            <Text.Body>
                              <strong>Canales asignados:</strong>
                            </Text.Body>
                            <ul style={{ margin: '0', paddingLeft: '20px' }}>
                              {userChannels.map((channel, index) => (
                                <li key={index}>
                                  <Text.Body>
                                    {getChannelName(channel)} ({channel.id})
                                    {channel.storeKey && <span> - Tienda: {channel.storeName || channel.storeKey}</span>}
                                    {channel.fromCatalog && <span> - Catálogo: {channel.key || 'Sin key'}</span>}
                                  </Text.Body>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        
                        <Text.Body>
                          <strong>Canal seleccionado automáticamente:</strong> {selectedStore || 'Ninguno'}
                        </Text.Body>
                        <Text.Body>
                          <strong>Objeto Completo:</strong>
                        </Text.Body>
                        <pre style={{ maxHeight: '200px', overflow: 'auto', background: '#f5f5f5', padding: '8px', fontSize: '12px' }}>
                          {JSON.stringify(userValue, null, 2)}
                        </pre>
                      </>
                    );
                  } catch (error) {
                    return <Text.Body>Error al procesar los datos del usuario: {error.message}</Text.Body>;
                  }
                })()}
              </Spacings.Stack>
            </Spacings.Stack>
          </Card>
        </Spacings.Stack>
      )}

      <Spacings.Stack scale="l">
        <SelectField
          title={intl.formatMessage(messages.storeLabel)}
          name="store"
          value={selectedStore}
          options={storeOptions}
          onChange={handleStoreChange}
          placeholder={intl.formatMessage(messages.selectStore)}
          horizontalConstraint={13}
          isDisabled={storesLoading || storeOptions.length === 0 || (!userLoaded && userData)}
          hint={!userLoaded && userData ? "Seleccionando tienda automáticamente según permisos del usuario..." : undefined}
        />

        {storesLoading && (
          <Spacings.Stack scale="s" alignItems="center">
            <LoadingSpinner />
            <Text.Body intlMessage={messages.loadingStores} />
          </Spacings.Stack>
        )}

        {storeOptions.length === 0 && !storesLoading && (
          <ContentNotification type="info">
            <Text.Body intlMessage={messages.noStores} />
          </ContentNotification>
        )}
      </Spacings.Stack>

      {productsLoading && initialLoadComplete && (
        <Spacings.Stack scale="s" alignItems="center">
          <LoadingSpinner />
          <Text.Body>
            {intl.formatMessage(messages.loadingProducts)} 
            {selectedStore && <strong> ({selectedStore})</strong>}
          </Text.Body>
        </Spacings.Stack>
      )}

      {productsPaginatedResult && selectedDistributionChannel ? (
        <Spacings.Stack scale="l">
          <DataTable
            isCondensed
            columns={columns}
            rows={productsPaginatedResult.results || []}
            itemRenderer={(item, column) =>
              itemRenderer(item, column, dataLocale, projectLanguages)
            }
            sortedBy={tableSorting.value.key}
            sortDirection={tableSorting.value.order}
            onSortChange={tableSorting.onChange}
            onRowClick={(row) => push(`${match.url}/${row.id}`)}
          />
          {productsPaginatedResult.results && productsPaginatedResult.results.length > 0 ? (
            <Pagination
              page={page.value}
              onPageChange={page.onChange}
              perPage={perPage.value}
              onPerPageChange={perPage.onChange}
              totalItems={productsPaginatedResult.total}
            />
          ) : (
            <ContentNotification type="info">
              <Text.Body intlMessage={messages.noResults} />
            </ContentNotification>
          )}
          <Switch>
            <SuspendedRoute path={`${match.path}/:productId`}>
              <ProductDetails 
                onClose={() => push(`${match.url}`)} 
                storeKey={selectedStore} 
              />
            </SuspendedRoute>
          </Switch>
        </Spacings.Stack>
      ) : selectedStore && !productsLoading ? (
        <ContentNotification type="info">
          <Text.Body intlMessage={messages.noResults} />
        </ContentNotification>
      ) : null}
    </Spacings.Stack>
  );
};

Products.displayName = 'Products';
Products.propTypes = {
  linkToWelcome: PropTypes.string.isRequired,
};

export default Products; 