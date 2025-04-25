import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  PageNotFound,
  FormModalPage,
} from '@commercetools-frontend/application-components';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { formatLocalizedString, transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { useProductDetailsFetcher } from '../../hooks/use-product-details-connector';
import { getErrorMessage } from '../../helpers';
import { useState, useEffect } from 'react';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import TextField from '@commercetools-uikit/text-field';
import Card from '@commercetools-uikit/card';
import Tag from '@commercetools-uikit/tag';
import { BackIcon, AngleDownIcon, AngleRightIcon, PlusBoldIcon } from '@commercetools-uikit/icons';
import { ApplicationPageTitle } from '@commercetools-frontend/application-shell';
import DataTable from '@commercetools-uikit/data-table';
import Grid from '@commercetools-uikit/grid';
import Constraints from '@commercetools-uikit/constraints';
import messages from './messages';

// Tabs IDs
const GENERAL_TAB = 'general';
const VARIANTS_TAB = 'variants';

// Función auxiliar para formatear valores JSON de atributos
const formatAttributeValue = (value) => {
  if (value === null || value === undefined) return '-';
  
  // Caso especial para equipacion (muestra solo el label)
  if (typeof value === 'object' && Array.isArray(value)) {
    if (value.length > 0 && value[0].label) {
      return value[0].label;
    }
  }
  
  // Para otros objetos JSON
  if (typeof value === 'object') {
    if (value.label) return value.label;
    return JSON.stringify(value);
  }
  
  // Para valores booleanos (como esPersonalizable)
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }
  
  return value.toString();
};

// Mapa para obtener nombres más amigables para los atributos
const getAttributeDisplayName = (attributeName) => {
  const attributeMap = {
    'equipacion': 'Equipación',
    'material': 'Material',
    'tecnologia': 'Tecnología',
    'escudo': 'Escudo',
    'nombreJugador': 'Nombre Jugador',
    'numeroCamiseta': 'Número Camiseta',
    'temporada': 'Temporada',
    'esPersonalizable': 'Es Personalizable',
    'edicionEspecial': 'Edición Especial'
  };
  
  return attributeMap[attributeName] || attributeName;
};

// Función para formatear fechas ISO en formato legible
const formatDate = (isoDate) => {
  if (!isoDate) return '-';
  try {
    const date = new Date(isoDate);
    return date.toLocaleString();
  } catch (error) {
    return isoDate;
  }
};

// Función para obtener un nombre amigable para el SKU de variante (extrae el tamaño)
const getVariantSizeName = (sku) => {
  if (!sku) return '';
  const parts = sku.split('-');
  if (parts.length > 1) {
    const size = parts[parts.length - 1].toUpperCase();
    return `Talla ${size}`;
  }
  return sku;
};

// Componente personalizado para sección colapsable
const CollapsibleSection = ({ title, isOpen, onToggle, children, count }) => {
  return (
    <div style={{ marginBottom: '32px' }}>
      <Spacings.Stack scale="s">
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '16px',
            marginBottom: '16px'
          }} 
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
          <Spacings.Stack scale="l" style={{ marginLeft: '32px', marginTop: '16px' }}>
            {children}
          </Spacings.Stack>
        )}
      </Spacings.Stack>
    </div>
  );
};

// Componente para el panel de metadatos
const MetadataPanel = ({ product, intl }) => {
  return (
    <div style={{ height: '100%', marginLeft: '48px', paddingTop: '12px' }}>
      <Spacings.Stack scale="s">
        <div style={{ display: 'flex', gap: '4px' }}>
          <Text.Detail tone="secondary">{intl.formatMessage(messages.fechaCreacion)}:</Text.Detail>
          <Text.Detail>{formatDate(product.createdAt)}</Text.Detail>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Text.Detail tone="secondary">{intl.formatMessage(messages.fechaModificacion)}:</Text.Detail>
          <Text.Detail>{formatDate(product.lastModifiedAt)}</Text.Detail>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Text.Detail tone="secondary">{intl.formatMessage(messages.tipoProducto)}:</Text.Detail>
          <Text.Detail>{product.productType?.name || '-'}</Text.Detail>
        </div>
      </Spacings.Stack>
    </div>
  );
};

MetadataPanel.propTypes = {
  product: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
};

const ProductDetails = (props) => {
  const intl = useIntl();
  const params = useParams();
  const productId = params.productId;
  const [activeTab, setActiveTab] = useState(GENERAL_TAB);
  // Estados para las secciones colapsables
  const [generalInfoOpen, setGeneralInfoOpen] = useState(true);
  const [attributesOpen, setAttributesOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(true);

  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));

  const { product, error, loading, refetch } = useProductDetailsFetcher(productId, props.storeKey);

  // Forzar refetch cuando cambia la tienda
  useEffect(() => {
    if (props.storeKey && refetch) {
      refetch();
    }
  }, [props.storeKey, refetch]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  if (!product) {
    return <PageNotFound />;
  }

  const productName = formatLocalizedString(
    {
      name: transformLocalizedFieldToLocalizedString(product.masterData.current.nameAllLocales || []),
    },
    {
      key: 'name',
      locale: dataLocale,
      fallbackOrder: projectLanguages,
      fallback: NO_VALUE_FALLBACK,
    }
  );

  const masterVariant = product.masterData.current.masterVariant || {};
  const attributesRaw = masterVariant.attributesRaw || [];
  const categories = product.masterData.current.categories || [];
  const isPublished = product.masterData.published || false;
  const hasStagedChanges = product.masterData.hasStagedChanges || false;

  // Ordenar atributos por nombres
  const sortedAttributes = [...attributesRaw].sort((a, b) => {
    return getAttributeDisplayName(a.name).localeCompare(getAttributeDisplayName(b.name));
  });

  return (
    <FormModalPage
      title={productName}
      isOpen
      onClose={props.onClose}
      hideControls={true}
    >
      <ApplicationPageTitle additionalParts={[productName]} />
      
      <Spacings.Stack scale="l">       
        {/* Custom Tabs */}
        <Spacings.Inline scale="s">
          <SecondaryButton
            onClick={() => handleTabChange(GENERAL_TAB)}
            isActive={activeTab === GENERAL_TAB}
            label={intl.formatMessage(messages.generalTab)}
          />
          <SecondaryButton
            onClick={() => handleTabChange(VARIANTS_TAB)}
            isActive={activeTab === VARIANTS_TAB}
            label={intl.formatMessage(messages.variantsTab)}
          />
        </Spacings.Inline>

        {/* Layout de dos columnas principal - Solo para la pestaña General */}
        {activeTab === GENERAL_TAB ? (
          <div style={{ display: 'flex' }}>
            {/* Columna izquierda (60%) - Paneles colapsables */}
            <div style={{ width: '60%' }}>
              <Spacings.Stack scale="xl">
                {/* General Information */}
                <CollapsibleSection 
                  title={intl.formatMessage(messages.generalInformation)}
                  isOpen={generalInfoOpen} 
                  onToggle={() => setGeneralInfoOpen(!generalInfoOpen)}
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
                    
                    {product.masterData.current.masterVariant?.sku && (
                      <TextField
                        title="SKU principal"
                        value={product.masterData.current.masterVariant.sku}
                        isReadOnly
                        horizontalConstraint="scale"
                  />
                )}
              </Spacings.Stack>
                  
                  {/* Descripción del producto */}
                  {product.masterData.current.descriptionAllLocales && 
                    product.masterData.current.descriptionAllLocales.length > 0 && (
                    <Spacings.Stack scale="m" style={{ marginTop: '24px' }}>
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
                
                {/* Product Attributes */}
                <CollapsibleSection 
                  title={intl.formatMessage(messages.atributosProducto)}
                  isOpen={attributesOpen} 
                  onToggle={() => setAttributesOpen(!attributesOpen)}
                >
                {sortedAttributes.length > 0 ? (
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
                              key={attribute.name}
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
                        key={attribute.name}
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
                
                {/* Categorías */}
                <CollapsibleSection 
                  title={intl.formatMessage(messages.categorias)}
                  isOpen={categoriesOpen} 
                  onToggle={() => setCategoriesOpen(!categoriesOpen)}
                  count={categories.length}
            >
              {categories.length > 0 ? (
                    <div style={{ maxWidth: '80%' }}>
                <Spacings.Inline scale="s" alignItems="center" flexWrap="wrap">
                  {categories.map((category) => (
                    <Tag key={category.id} type="normal">
                            {formatLocalizedString(
                              { name: transformLocalizedFieldToLocalizedString(category.nameAllLocales || []) },
                            {
                                key: 'name',
                              locale: dataLocale,
                              fallbackOrder: projectLanguages,
                              fallback: category.id,
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
          </Spacings.Stack>
            </div>

            {/* Columna derecha (40%) - Metadatos siempre visibles */}
            <div style={{ width: '40%' }}>
              <MetadataPanel product={product} intl={intl} />
            </div>
          </div>
        ) : (
          /* Variants Tab Content - Una sola columna sin panel de metadatos */
          <Spacings.Stack scale="l">
            <div style={{ width: '100%' }}>
              {/* Cabecera con fechas y botón */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Text.Detail tone="secondary">{intl.formatMessage(messages.fechaCreacion)}:</Text.Detail>
                    <Text.Detail>{formatDate(product.createdAt)}</Text.Detail>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Text.Detail tone="secondary">{intl.formatMessage(messages.fechaModificacion)}:</Text.Detail>
                    <Text.Detail>{formatDate(product.lastModifiedAt)}</Text.Detail>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <SecondaryButton
                      label={intl.formatMessage(messages.addVariant)}
                      iconLeft={<PlusBoldIcon />}
                      onClick={() => {/* Acción para agregar variante */}}
                    />
                  </div>
                </div>
              </div>
              
              {/* Tabla de variantes */}
              <DataTable
                columns={[
                  { key: 'no', label: 'No.' },
                  { key: 'id', label: 'Variant ID' },
                  { key: 'sku', label: 'SKU' },
                  { key: 'key', label: 'Key' },
                  { key: 'images', label: 'Images' },
                  { key: 'price', label: 'Pricing from' },
                  { key: 'inventory', label: 'Inventory: Quantity (Channel)' },
                  { key: 'attributes', label: 'Attributes' },
                ]}
                rows={[
                  // La variante principal
                  {
                    no: 1,
                    id: masterVariant.id,
                    sku: masterVariant.sku || '-',
                    key: masterVariant.key || masterVariant.sku || '-',
                    images: masterVariant.images?.length || 0,
                    price: masterVariant.prices?.length > 0 
                      ? `${masterVariant.prices[0].value.currencyCode} ${masterVariant.prices[0].value.centAmount / 100}` 
                      : '- -',
                    inventory: masterVariant.availability?.availableQuantity || '- -',
                    attributes: attributesRaw.length > 0 ? `${attributesRaw.length} / ${attributesRaw.length}` : '0 / 0',
                    original: masterVariant
                  },
                  // Las otras variantes
                  ...product.masterData.current.variants.map((variant, index) => ({
                    no: index + 2,
                    id: variant.id,
                    sku: variant.sku || '-',
                    key: variant.key || variant.sku || '-',
                    images: variant.images?.length || 0,
                    price: variant.prices?.length > 0 
                      ? `${variant.prices[0].value.currencyCode} ${variant.prices[0].value.centAmount / 100}` 
                      : '- -',
                    inventory: variant.availability?.availableQuantity || '- -',
                    attributes: variant.attributesRaw?.length > 0 
                      ? `${variant.attributesRaw.length} / ${variant.attributesRaw.length}` 
                      : '0 / 0',
                    original: variant
                  }))
                ]}
                itemRenderer={(item, column) => {
                  switch (column.key) {
                    case 'no':
                      return item.no;
                    case 'id':
                      return item.id;
                    case 'sku':
                      return item.sku;
                    case 'key':
                      return item.key;
                    case 'images':
                      return item.images;
                    case 'price':
                      return item.price;
                    case 'inventory':
                      return item.inventory;
                    case 'attributes':
                      return item.attributes;
                    default:
                      return item[column.key];
                  }
                }}
              />
              
              {/* Elementos de paginación */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', alignItems: 'center' }}>
                <div>
                  <select 
                    style={{ 
                      padding: '8px', 
                      borderRadius: '4px', 
                      border: '1px solid #ddd' 
                    }}
                    defaultValue="20"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <Text.Detail style={{ marginLeft: '8px' }}>Items per page (5 items)</Text.Detail>
                </div>
                
                <div>
                  <button 
                    style={{ 
                      padding: '8px 12px', 
                      marginRight: '8px', 
                      borderRadius: '4px', 
                      border: '1px solid #ddd',
                      background: 'white'
                    }}
                    disabled
                  >
                    &lt;
                  </button>
                  <Text.Detail style={{ margin: '0 8px' }}>Page</Text.Detail>
                  <input 
                    type="text" 
                    value="1" 
                    readOnly
                    style={{ 
                      width: '40px', 
                      textAlign: 'center',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      margin: '0 8px'
                    }}
                  />
                  <Text.Detail style={{ margin: '0 8px' }}>of 1</Text.Detail>
                  <button 
                    style={{ 
                      padding: '8px 12px', 
                      marginLeft: '8px', 
                      borderRadius: '4px', 
                      border: '1px solid #ddd',
                      background: 'white'
                    }}
                    disabled
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </Spacings.Stack>
        )}
      </Spacings.Stack>
    </FormModalPage>
  );
};

CollapsibleSection.propTypes = {
  title: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  count: PropTypes.number,
};

ProductDetails.displayName = 'ProductDetails';
ProductDetails.propTypes = {
  onClose: PropTypes.func.isRequired,
  storeKey: PropTypes.string,
};

export default ProductDetails; 