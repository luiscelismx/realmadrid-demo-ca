// Componente para formatear direcciones
export const formatAddress = (address) => {
  if (!address) return '-';
  
  const parts = [];
  if (address.firstName || address.lastName) {
    parts.push(`${address.firstName || ''} ${address.lastName || ''}`.trim());
  }
  if (address.streetName) {
    const streetPart = `${address.streetName}${address.streetNumber ? ` ${address.streetNumber}` : ''}`;
    parts.push(streetPart);
  }
  if (address.city || address.postalCode) {
    parts.push(`${address.postalCode || ''} ${address.city || ''}`.trim());
  }
  if (address.country) {
    parts.push(address.country);
  }
  
  return parts.join(', ') || '-';
};

// Componente para formatear precios
export const formatPrice = (price) => {
  if (!price) return '-';
  return `${price.currencyCode} ${price.centAmount / 100}`;
};

// Componente para formatear fechas
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
}; 