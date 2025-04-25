/**
 * Formatea valores de atributos para visualización
 */
export const formatAttributeValue = (value) => {
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
export const getAttributeDisplayName = (attributeName) => {
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
 * Formatea fechas ISO a formato legible
 */
export const formatDate = (isoDate) => {
  if (!isoDate) return '-';
  try {
    const date = new Date(isoDate);
    return date.toLocaleString();
  } catch (error) {
    return isoDate || '-';
  }
};

/**
 * Extrae el tamaño desde un SKU para mostrar un nombre amigable
 */
export const getVariantSizeName = (sku) => {
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