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
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import TextField from '@commercetools-uikit/text-field';
import Tag from '@commercetools-uikit/tag';
import { BackIcon, AngleDownIcon, AngleRightIcon, PlusBoldIcon } from '@commercetools-uikit/icons';
import { ApplicationPageTitle } from '@commercetools-frontend/application-shell';
import DataTable from '@commercetools-uikit/data-table';
import Grid from '@commercetools-uikit/grid';
import messages from './messages';

// Importaciones de archivos separados para la refactorización
import { GENERAL_TAB, VARIANTS_TAB, STYLES } from './constants';
import { useFormattedProductData, useVariantRows, useCollapsibleSections, useActiveTab } from './hooks';
import { CollapsibleSection } from './components/collapsible-section';
import { MetadataPanel } from './components/metadata-panel';
import { GeneralInfoSection } from './components/general-info-section';
import { AttributesSection } from './components/attributes-section';
import { CategoriesSection } from './components/categories-section';
import { VariantsHeader } from './components/variants-header';
import { PaginationControls } from './components/pagination-controls';
import { formatDate } from './utils';

/**
 * Formatea valores de atributos para visualización
 */
const formatAttributeValue = (value) => {
  if (value === null || value === undefined) return '-';
  
  // Caso especial para equipacion (muestra solo el label)
  if (typeof value === 'object' && Array.isArray(value)) {
    if (value.length > 0 && value[0]?.label) {
      return value[0].label;
    }
  }
  
  // Para otros objetos JSON
  if (typeof value === 'object') {
    if (value?.label) return value.label;
    try {
      return JSON.stringify(value);
    } catch (error) {
      return '-';
    }
  }
  
  // Para valores booleanos (como esPersonalizable)
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }
  
  try {
    return String(value);
  } catch (error) {
    return '-';
  }
};

/**
 * Mapa para obtener nombres amigables para atributos
 */
const getAttributeDisplayName = (attributeName) => {
  if (!attributeName) return '';
  
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

/**
 * Extrae el tamaño desde un SKU para mostrar un nombre amigable
 */
const getVariantSizeName = (sku) => {
  if (!sku) return '';
  try {
    const parts = sku.split('-');
    if (parts.length > 1) {
      const size = parts[parts.length - 1].toUpperCase();
      return `Talla ${size}`;
    }
    return sku;
  } catch (error) {
    return sku || '';
  }
};

/**
 * Componente principal de detalles del producto
 */
const ProductDetails = (props) => {
  const intl = useIntl();
  const params = useParams();
  const productId = params.productId;
  const { activeTab, setActiveTab } = useActiveTab(GENERAL_TAB);
  const { sections } = useCollapsibleSections();

  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context?.dataLocale ?? '',
    projectLanguages: context?.project?.languages ?? [],
  }));

  const { product, error, loading, refetch } = useProductDetailsFetcher(productId, props.storeKey);

  // Procesamiento de datos del producto
  const productData = useFormattedProductData(product, dataLocale, projectLanguages);
  
  // Filas para tabla de variantes
  const variantRows = useVariantRows(productData);

  // Forzar refetch cuando cambia la tienda
  useEffect(() => {
    if (props.storeKey && refetch) {
      refetch();
    }
  }, [props.storeKey, refetch]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, [setActiveTab]);

  // Renderizador de celdas para la tabla de variantes
  const itemRenderer = useCallback((item, column) => {
    if (!item) return '-';
    
    try {
      switch (column.key) {
        case 'no': return item.no || '-';
        case 'id': return item.id || '-';
        case 'sku': return item.sku || '-';
        case 'key': return item.key || '-';
        case 'images': return item.images || 0;
        case 'price': return item.price || '- -';
        case 'inventory': return item.inventory || '- -';
        case 'attributes': return item.attributes || '0 / 0';
        default: return item[column.key] || '-';
      }
    } catch (error) {
      console.error('Error al renderizar celda:', error);
      return '-';
    }
  }, []);

  // Renderizado condicional para estados de carga/error
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

  if (!product || !productData) {
    return <PageNotFound />;
  }

  const { productName } = productData;

  // Renderizado principal del componente
  return (
    <FormModalPage
      title={productName}
      isOpen
      onClose={props.onClose}
      hideControls={true}
    >
      <ApplicationPageTitle additionalParts={[productName]} />
      
      <Spacings.Stack scale="l">       
        {/* Tabs de navegación */}
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

        {/* Layout condicional según la pestaña activa */}
        {activeTab === GENERAL_TAB ? (
          // Pestaña General - Layout de dos columnas
          <div style={STYLES.layout.flexContainer}>
            {/* Columna izquierda (60%) - Paneles colapsables */}
            <div style={STYLES.layout.leftColumn}>
              <Spacings.Stack scale="xl">
                {/* General Information */}
                <GeneralInfoSection 
                  product={product}
                  productName={productName}
                  dataLocale={dataLocale}
                  projectLanguages={projectLanguages}
                  isOpen={sections.generalInfo.isOpen}
                  onToggle={sections.generalInfo.toggle}
                  intl={intl}
                />
                
                {/* Product Attributes */}
                <AttributesSection 
                  sortedAttributes={productData.sortedAttributes}
                  isOpen={sections.attributes.isOpen}
                  onToggle={sections.attributes.toggle}
                  intl={intl}
                />
                
                {/* Categorías */}
                <CategoriesSection
                  categories={productData.categories}
                  dataLocale={dataLocale}
                  projectLanguages={projectLanguages}
                  isOpen={sections.categories.isOpen}
                  onToggle={sections.categories.toggle}
                  intl={intl}
                />
              </Spacings.Stack>
            </div>

            {/* Columna derecha (40%) - Metadatos siempre visibles */}
            <div style={STYLES.layout.rightColumn}>
              <MetadataPanel product={product} intl={intl} />
            </div>
          </div>
        ) : (
          // Pestaña Variantes - Layout de una sola columna
          <Spacings.Stack scale="l">
            <div style={STYLES.layout.fullWidth}>
              {/* Cabecera con fechas y botón */}
              <VariantsHeader 
                product={product} 
                intl={intl} 
              />
              
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
                rows={variantRows}
                itemRenderer={itemRenderer}
              />
              
              {/* Elementos de paginación */}
              <PaginationControls />
            </div>
          </Spacings.Stack>
        )}
      </Spacings.Stack>
    </FormModalPage>
  );
};

ProductDetails.displayName = 'ProductDetails';
ProductDetails.propTypes = {
  onClose: PropTypes.func.isRequired,
  storeKey: PropTypes.string,
};

export default ProductDetails;