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
    view: ['view_products', 'view_product_selections'],
    manage: ['manage_products', 'manage_stores'],
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
      uriPath: 'products-by-store',
      defaultLabel: 'Productos por Tienda',
      labelAllLocales: [],
      permissions: [PERMISSIONS.Manage],
    },
  ],
};

export default config;
