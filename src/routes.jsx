import { Switch, Route, useRouteMatch } from 'react-router-dom';
import Spacings from '@commercetools-uikit/spacings';
import Channels from './components/channels';
import ProductsByCategory from './components/products-by-category';
import ProductsBySelection from './components/products-by-selection';
import ProductsByProvider from './components/products-by-provider';
import Orders from './components/orders';
import Welcome from './components/welcome';
import { UserManagement } from './components';

const ApplicationRoutes = () => {
  const match = useRouteMatch();

  /**
   * When using routes, there is a good chance that you might want to
   * restrict the access to a certain route based on the user permissions.
   * You can evaluate user permissions using the `useIsAuthorized` hook.
   * For more information see https://docs.commercetools.com/merchant-center-customizations/development/permissions
   *
   * NOTE that by default the Custom Application implicitly checks for a "View" permission,
   * otherwise it won't render. Therefore, checking for "View" permissions here
   * is redundant and not strictly necessary.
   */

  return (
    <Spacings.Inset scale="l">
      <Switch>
        <Route path={`${match.path}/channels`}>
          <Channels linkToWelcome={match.url} />
        </Route>

        <Route path={`${match.path}/products-by-selection`}>
          <ProductsBySelection linkToWelcome={match.url} />
        </Route>
        <Route path={`${match.path}/products-by-category`}>
          <ProductsByCategory linkToWelcome={match.url} />
        </Route>
        <Route path={`${match.path}/products-by-provider`}>
          <ProductsByProvider linkToWelcome={match.url} />
        </Route>
        <Route path={`${match.path}/orders`}>
          <Orders linkToWelcome={match.url} />
        </Route>
        <Route path={`${match.path}/user-management`}>
          <UserManagement linkToWelcome={match.url} />
        </Route>
        <Route>
          <Welcome />
        </Route>
      </Switch>
    </Spacings.Inset>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
