import { useState, useCallback, useMemo } from 'react';
import { formatLocalizedString, transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { getAttributeDisplayName } from './utils';

/**
 * Hook para gestionar la pestaña activa
 */
export const useActiveTab = (initialTab) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  return { activeTab, setActiveTab };
};

/**
 * Hook personalizado para manejar el estado de los paneles colapsables
 */
export const useCollapsibleSections = () => {
  const [sectionsState, setSectionsState] = useState({
    generalInfo: true,
    attributes: false,
    categories: false,
    variants: true
  });

  const toggleSection = useCallback((sectionName) => {
    setSectionsState(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  }, []);

  return {
    sections: {
      generalInfo: { 
        isOpen: sectionsState.generalInfo, 
        toggle: useCallback(() => toggleSection('generalInfo'), [toggleSection]) 
      },
      attributes: { 
        isOpen: sectionsState.attributes, 
        toggle: useCallback(() => toggleSection('attributes'), [toggleSection]) 
      },
      categories: { 
        isOpen: sectionsState.categories, 
        toggle: useCallback(() => toggleSection('categories'), [toggleSection]) 
      },
      variants: { 
        isOpen: sectionsState.variants, 
        toggle: useCallback(() => toggleSection('variants'), [toggleSection]) 
      }
    }
  };
};

/**
 * Formatea datos de producto de manera segura
 */
export const useFormattedProductData = (product, dataLocale, projectLanguages) => {
  return useMemo(() => {
    if (!product) return null;

    try {
      // Información básica
      const masterVariant = product.masterData?.current?.masterVariant || {};
      const attributesRaw = masterVariant.attributesRaw || [];
      const categories = product.masterData?.current?.categories || [];
      const isPublished = product.masterData?.published || false;
      const hasStagedChanges = product.masterData?.hasStagedChanges || false;
      
      // Nombre del producto formateado
      const nameAllLocales = product.masterData?.current?.nameAllLocales || [];
      const productName = formatLocalizedString(
        {
          name: transformLocalizedFieldToLocalizedString(nameAllLocales),
        },
        {
          key: 'name',
          locale: dataLocale,
          fallbackOrder: projectLanguages,
          fallback: NO_VALUE_FALLBACK,
        }
      );
      
      // Atributos ordenados
      const sortedAttributes = [...attributesRaw].sort((a, b) => 
        getAttributeDisplayName(a.name).localeCompare(getAttributeDisplayName(b.name))
      );
      
      // Datos para variantes
      const variants = product.masterData?.current?.variants || [];
      
      return {
        productName,
        masterVariant,
        attributesRaw,
        sortedAttributes,
        categories,
        isPublished,
        hasStagedChanges,
        variants
      };
    } catch (error) {
      console.error('Error al formatear datos del producto:', error);
      return {
        productName: 'Error al cargar nombre',
        masterVariant: {},
        attributesRaw: [],
        sortedAttributes: [],
        categories: [],
        isPublished: false,
        hasStagedChanges: false,
        variants: []
      };
    }
  }, [product, dataLocale, projectLanguages]);
};

/**
 * Construye filas para tabla de variantes de manera segura
 */
export const useVariantRows = (productData) => {
  return useMemo(() => {
    if (!productData) return [];
    
    const { masterVariant, attributesRaw, variants } = productData;
    
    try {
      // Variante principal
      const masterVariantRow = {
        no: 1,
        id: masterVariant.id,
        sku: masterVariant.sku || '-',
        key: masterVariant.key || masterVariant.sku || '-',
        images: masterVariant.images?.length || 0,
        price: masterVariant.prices?.length > 0 
          ? `${masterVariant.prices[0]?.value?.currencyCode || ''} ${(masterVariant.prices[0]?.value?.centAmount || 0) / 100}` 
          : '- -',
        inventory: masterVariant.availability?.availableQuantity || '- -',
        attributes: attributesRaw.length > 0 ? `${attributesRaw.length} / ${attributesRaw.length}` : '0 / 0',
        original: masterVariant
      };
      
      // Otras variantes
      const variantRows = variants.map((variant, index) => ({
        no: index + 2,
        id: variant.id,
        sku: variant.sku || '-',
        key: variant.key || variant.sku || '-',
        images: variant.images?.length || 0,
        price: variant.prices?.length > 0 
          ? `${variant.prices[0]?.value?.currencyCode || ''} ${(variant.prices[0]?.value?.centAmount || 0) / 100}` 
          : '- -',
        inventory: variant.availability?.availableQuantity || '- -',
        attributes: variant.attributesRaw?.length > 0 
          ? `${variant.attributesRaw.length} / ${variant.attributesRaw.length}` 
          : '0 / 0',
        original: variant
      }));
      
      return [masterVariantRow, ...variantRows];
    } catch (error) {
      console.error('Error al construir filas de variantes:', error);
      return [];
    }
  }, [productData]);
}; 