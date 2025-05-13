import { PERMISSIONS, entryPointUriPath } from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomApplication}
 */
const config = {
  name: 'Starter Ee814f',
  entryPointUriPath,
  cloudIdentifier: 'aws-us',
  env: {
    development: {
      initialProjectKey: 'demo-exchange',
    },
    production: {
      applicationId: 'TODO',
      url: 'https://your_app_hostname.com',
    },
  },
  oAuthScopes: {
    view: ['view_products', 'view_product_selections', "view_orders", "view_customers", "view_customer_groups"],
    manage: ['manage_products', 'manage_stores', "manage_orders", "manage_customers", "manage_customer_groups"],
  },
  icon: '${path:@commercetools-frontend/assets/application-icons/star.svg}',
  mainMenuLink: {
    defaultLabel: 'VIP Admin',
    labelAllLocales: [],
    permissions: [PERMISSIONS.View],
  },
  submenuLinks: [
    {
      uriPath: 'channels',
      defaultLabel: 'Canales',
      labelAllLocales: [],
      permissions: [PERMISSIONS.View],
    },
    {
      uriPath: 'products-by-selection',
      defaultLabel: 'Productos por Selección',
      labelAllLocales: [],
      permissions: [PERMISSIONS.Manage],
    },
    {
      uriPath: 'products-by-category',
      defaultLabel: 'Productos por Categoria',
      labelAllLocales: [],
      permissions: [PERMISSIONS.Manage],
    },
    {
      uriPath: 'orders',
      defaultLabel: 'Pedidos por Canal',
      labelAllLocales: [],
      permissions: [PERMISSIONS.Manage],
    },
    {
      uriPath: 'user-management',
      defaultLabel: 'Administración de Usuarios',
      labelAllLocales: [],
      permissions: [PERMISSIONS.Manage],
    },
  ],
};

export default config;
