import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'ProductsByProvider.title',
    defaultMessage: 'Productos por Proveedor',
  },
  backToWelcome: {
    id: 'ProductsByProvider.backToWelcome',
    defaultMessage: 'Volver a la página de bienvenida',
  },
  demoHint: {
    id: 'ProductsByProvider.demoHint',
    defaultMessage:
      'Este componente muestra los productos disponibles en el canal del proveedor asignado al usuario actual.',
  },
  loadingProducts: {
    id: 'ProductsByProvider.loadingProducts',
    defaultMessage: 'Cargando productos...',
  },
  loadingUserData: {
    id: 'ProductsByProvider.loadingUserData',
    defaultMessage: 'Cargando información del usuario...',
  },
  noProvider: {
    id: 'ProductsByProvider.noProvider',
    defaultMessage:
      'No se ha encontrado un proveedor asignado al usuario actual. Por favor, contacte al administrador.',
  },
  noCategory: {
    id: 'ProductsByProvider.noCategory',
    defaultMessage:
      'No se ha encontrado una categoría asignada al usuario actual. Por favor, contacte al administrador para asignar una categoría.',
  },
  noResults: {
    id: 'ProductsByProvider.noResults',
    defaultMessage: 'No se encontraron productos para la categoría seleccionada.',
  },
  channelId: {
    id: 'ProductsByProvider.channelId',
    defaultMessage: 'ID del Canal del Proveedor',
  },
  userInfo: {
    id: 'ProductsByProvider.userInfo',
    defaultMessage: 'Información del Usuario',
  },
}); 