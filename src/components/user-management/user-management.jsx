import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useQuery, useMutation } from '@apollo/client/react';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import {
  useShowNotification,
  useShowApiErrorNotification,
} from '@commercetools-frontend/actions-global';
import Spacings from '@commercetools-uikit/spacings';
import DataTable from '@commercetools-uikit/data-table';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Text from '@commercetools-uikit/text';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { Pagination } from '@commercetools-uikit/pagination';
import TextField from '@commercetools-uikit/text-field';
import SelectField from '@commercetools-uikit/select-field';
import Constraints from '@commercetools-uikit/constraints';
import Card from '@commercetools-uikit/card';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import FetchUsersQuery from './graphql/fetch-users.graphql';
import CreateUserMutation from './graphql/create-user.graphql';
import UpdateUserMutation from './graphql/update-user.graphql';
import { useChannelsFetcher } from '../../hooks/use-channels-connector';
import { useCategoriesFetcher } from '../../hooks/use-categories-connector';
import { useProductSelectionsFetcher } from '../../hooks/use-product-selections-connector';
import UserForm from './user-form';
import messages from './messages';

const columns = [
  {
    key: 'email',
    label: <FormattedMessage id="UserManagement.column.email" defaultMessage="Email" />,
  },
  {
    key: 'name',
    label: <FormattedMessage id="UserManagement.column.name" defaultMessage="Name" />,
  },
  {
    key: 'roles',
    label: <FormattedMessage id="UserManagement.column.roles" defaultMessage="Role(s)" />,
  },
  {
    key: 'providers',
    label: <FormattedMessage id="UserManagement.column.providers" defaultMessage="Provider(s)" />,
  },
  {
    key: 'categories',
    label: <FormattedMessage id="UserManagement.column.categories" defaultMessage="Categories" />,
  },
  {
    key: 'productSelections',
    label: <FormattedMessage id="UserManagement.column.productSelections" defaultMessage="Product Selections" />,
  },
  {
    key: 'createdAt',
    label: <FormattedMessage id="UserManagement.column.createdAt" defaultMessage="Created At" />,
  },
  {
    key: 'active',
    label: <FormattedMessage id="UserManagement.column.active" defaultMessage="Active" />,
  },
  {
    key: 'elementType',
    label: <FormattedMessage id="UserManagement.column.elementType" defaultMessage="Proveedor CF" />,
  },
];

const USER_CONTAINER = 'app-users';

const getChannelName = (channel, locale) => {
  const localizedName = channel.nameAllLocales?.find(name => name.locale === locale);
  return localizedName?.value || channel.nameAllLocales?.[0]?.value || channel.key || channel.id;
}

const getRoleOptions = (intl) => [
  { value: '', label: intl.formatMessage(messages.allRoles) },
  { value: 'admin', label: intl.formatMessage(messages.adminRole) },
  { value: 'user', label: intl.formatMessage(messages.userRole) },
];

const getStatusOptions = (intl) => [
  { value: '', label: intl.formatMessage(messages.allStatus) },
  { value: 'true', label: intl.formatMessage(messages.statusActive) },
  { value: 'false', label: intl.formatMessage(messages.statusInactive) },
];

const getColumns = (intl, onEdit, onToggleActive) => [
  {
    key: 'email',
    label: <FormattedMessage id="UserManagement.column.email" defaultMessage="Email" />,
    flexGrow: 1,
    renderItem: (row) => <Text.Body>{row.email}</Text.Body>,
  },
  {
    key: 'name',
    label: <FormattedMessage id="UserManagement.column.name" defaultMessage="Name" />,
    flexGrow: 1,
    renderItem: (row) => <Text.Body>{row.name}</Text.Body>,
  },
  {
    key: 'roles',
    label: <FormattedMessage id="UserManagement.column.roles" defaultMessage="Role(s)" />,
    flexGrow: 1,
    renderItem: (row) => <Text.Body>{row.roles}</Text.Body>,
  },
  {
    key: 'providers',
    label: <FormattedMessage id="UserManagement.column.providers" defaultMessage="Provider(s)" />,
    flexGrow: 1,
    renderItem: (row) => <Text.Body>{row.providers}</Text.Body>,
  },
  {
    key: 'categories',
    label: <FormattedMessage id="UserManagement.column.categories" defaultMessage="Categories" />,
    flexGrow: 1,
    renderItem: (row) => <Text.Body>{row.categories}</Text.Body>,
  },
  {
    key: 'productSelections',
    label: <FormattedMessage id="UserManagement.column.productSelections" defaultMessage="Product Selections" />,
    flexGrow: 1,
    renderItem: (row) => <Text.Body>{row.productSelections}</Text.Body>,
  },
  {
    key: 'elementType',
    label: <FormattedMessage id="UserManagement.column.elementType" defaultMessage="Proveedor CF" />,
    flexGrow: 1,
    renderItem: (row) => <Text.Body>{row.elementType}</Text.Body>,
  },
  {
    key: 'createdAt',
    label: <FormattedMessage id="UserManagement.column.createdAt" defaultMessage="Created At" />,
    flexGrow: 1,
    renderItem: (row) => <Text.Body>{row.createdAt}</Text.Body>,
  },
  {
    key: 'active',
    label: <FormattedMessage id="UserManagement.column.active" defaultMessage="Active" />,
    flexGrow: 0.5,
    renderItem: (row) => <Text.Body>{row.active === 'true' ? 'Activo' : 'Inactivo'}</Text.Body>,
  },
  {
    key: 'actions',
    label: <FormattedMessage id="UserManagement.column.actions" defaultMessage="Actions" />,
    renderItem: (row) => (
      <Spacings.Inline scale="s">
        <SecondaryButton
          label={intl.formatMessage(
            row.active === 'true' 
              ? messages.statusInactive 
              : messages.statusActive
          )}
          onClick={() => onToggleActive(row)}
          size="small"
        />
        <SecondaryButton
          label={intl.formatMessage(messages.editUserTitle)}
          onClick={() => onEdit(row.id)}
          size="small"
        />
      </Spacings.Inline>
    ),
  },
];

const UserManagement = () => {
  const intl = useIntl();
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  let whereConditions = [];
  if (debouncedSearchTerm) {
    whereConditions.push(`key = "${debouncedSearchTerm.toLowerCase()}" or value(email = "${debouncedSearchTerm.toLowerCase()}") or value(name = "${debouncedSearchTerm}")`);
  }

  if (roleFilter) {
    whereConditions.push(`value(roles contains "${roleFilter}")`);
  }

  if (statusFilter) {
    whereConditions.push(`value(active = ${statusFilter === 'true'})`);
  }

  const whereCondition = whereConditions.length > 0 ? whereConditions.join(' and ') : undefined;

  // Loguear la consulta FetchUsers
  const fetchVariables = {
    container: USER_CONTAINER,
    limit: perPage, 
    offset: (page - 1) * perPage,
    sort: ['key asc'],
    ...(whereCondition ? { where: whereCondition } : {}),
  };
  
  console.log('Ejecutando consulta FetchUsers con variables:', JSON.stringify(fetchVariables, null, 2));
  console.log('Condición WHERE:', whereCondition || 'Sin condición WHERE');
  console.log('Query GraphQL completa:');
  console.log(`
query FetchUsers($container: String!, $limit: Int, $offset: Int, $sort: [String!], $where: String) {
  customObjects(
    container: $container
    limit: $limit
    offset: $offset
    sort: $sort
    where: $where
  ) {
    total
    count
    offset
    results {
      id
      key
      version
      createdAt
      lastModifiedAt
      value
    }
  }
}
  `);

  const { 
    data: usersData,
    error: usersError,
    loading: usersLoading,
    refetch
  } = useQuery(FetchUsersQuery, {
    variables: fetchVariables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  const {
    channelsPaginatedResult,
    error: channelsError,
    loading: channelsLoading,
  } = useChannelsFetcher({
    page: { value: 1 },
    perPage: { value: 500 },
    tableSorting: { value: { key: 'key', order: 'asc' } },
  });

  const {
    categories,
    error: categoriesError,
    loading: categoriesLoading,
  } = useCategoriesFetcher();

  const {
    productSelections,
    error: productSelectionsError,
    loading: productSelectionsLoading,
  } = useProductSelectionsFetcher();

  const [createUser, { loading: createLoading }] = useMutation(CreateUserMutation, {
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  const [updateUser, { loading: updateLoading }] = useMutation(UpdateUserMutation, {
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  // Efecto para loguear los resultados cuando llegan
  useEffect(() => {
    if (usersData && !usersLoading) {
      console.log('Resultados de la consulta FetchUsers:', JSON.stringify(usersData, null, 2));
      console.log('Total de usuarios encontrados:', usersData?.customObjects?.total || 0);
    }
  }, [usersData, usersLoading]);

  useEffect(() => {
    // Log para depurar errores de mutación
    if (formError) {
      console.error('Error en formulario:', formError);
    }
  }, [formError]);

  if (usersLoading || channelsLoading || categoriesLoading || productSelectionsLoading) {
    return <LoadingSpinner />;
  }

  if (usersError || channelsError || categoriesError || productSelectionsError) {
    return (
      <ContentNotification type="error">
        {usersError?.message || channelsError?.message || categoriesError?.message || productSelectionsError?.message || 'Error loading data'}
      </ContentNotification>
    );
  }

  const users = usersData?.customObjects?.results || [];
  const totalUsers = usersData?.customObjects?.total || 0;
  const channels = channelsPaginatedResult?.results || [];

  // Log para depuración
  console.log('Usuarios cargados:', users.map(user => ({
    id: user.id,
    key: user.key,
    value: typeof user.value === 'string' ? JSON.parse(user.value) : user.value
  })));

  const channelMap = channels.reduce((map, channel) => {
    map[channel.id] = getChannelName(channel, intl.locale);
    return map;
  }, {});

  // Función para formatear fechas de manera segura
  const safeFormatDate = (dateStr) => {
    try {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      // Verificar si es una fecha válida
      if (isNaN(date.getTime())) return '-';
      return intl.formatDateTime(date);
    } catch (error) {
      console.error('Error formateando fecha:', dateStr, error);
      return '-';
    }
  };

  const prepareRowData = () => {
    if (!usersData?.customObjects?.results) return [];
    
    console.log('Procesando datos para tabla:', usersData.customObjects.results);
    
    return usersData.customObjects.results.map(user => {
      const userData = typeof user.value === 'string' ? JSON.parse(user.value) : user.value;
      console.log('User data procesado:', userData);

      // Obtener los nombres de los proveedores
      const providerNames = (userData.providerIds || []).map(id => {
        const channel = channelsPaginatedResult?.results?.find(c => c.id === id);
        return getChannelName(channel || { id }, intl.locale);
      }).join(', ');

      // Obtener los nombres de las categorías
      const categoryNames = (userData.categoryIds || []).map(id => {
        const category = categories?.find(c => c.id === id);
        if (!category) return id;
        const nameEs = category.nameAllLocales?.find(name => name.locale === 'es')?.value;
        const nameDefault = category.nameAllLocales?.[0]?.value;
        return nameEs || nameDefault || category.key || id;
      }).join(', ');

      // Obtener los nombres de las selecciones de productos
      const productSelectionNames = (userData.productSelectionIds || []).map(id => {
        const selection = productSelections?.find(s => s.id === id);
        if (!selection) return id;
        const nameEs = selection.nameAllLocales?.find(name => name.locale === 'es')?.value;
        const nameDefault = selection.nameAllLocales?.[0]?.value;
        return nameEs || nameDefault || selection.key || id;
      }).join(', ');

      // Mapear los tipos de elemento a sus etiquetas
      const elementTypeLabels = {
        'f&b': 'Comida y Bebida',
        'vip': 'Servicios VIP',
        'merchandising': 'Merchandising'
      };

      const elementTypeNames = (userData.elementTypeIds || [])
        .map(id => elementTypeLabels[id] || id)
        .join(', ');

      // Convertir la fecha de creación
      const createdAt = safeFormatDate(userData.createdAt);

      const rowData = {
        id: user.id,
        version: user.version,
        key: user.key,
        email: userData.email || '',
        name: userData.name || '',
        roles: (userData.roles || []).join(', '),
        providers: providerNames,
        categories: categoryNames,
        productSelections: productSelectionNames,
        elementType: elementTypeNames,
        createdAt,
        active: userData.active?.toString() || 'false',
      };
      
      console.log('Fila procesada para tabla:', rowData);
      return rowData;
    });
  };

  const rows = prepareRowData();
  console.log('Filas finales para la tabla:', rows);

  // Si hay errores severos que impiden la carga, mostrar un mensaje de error
  if (rows.length === 0 && users.length > 0) {
    return (
      <ContentNotification type="error">
        <Text.Body>
          {intl.formatMessage(messages.fetchError)} 
          Error al procesar los datos de usuario. Revise la consola para más detalles.
        </Text.Body>
      </ContentNotification>
    );
  }

  const totalPages = Math.ceil(totalUsers / perPage);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const handlePerPageChange = (event) => {
    setPerPage(Number(event.target.value));
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(1);
  };
  
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const findUserById = (userId) => {
    return users.find(user => user.id === userId);
  };

  const handleEdit = (userId) => {
    const user = findUserById(userId);
    if (user) {
      console.log('Usuario seleccionado para editar:', JSON.stringify({
        id: user.id,
        key: user.key,
        version: user.version,
        value: typeof user.value === 'string' ? JSON.parse(user.value) : user.value
      }, null, 2));
      
      setSelectedUser(user);
      setIsFormOpen(true);
      setFormError(null);
    } else {
      console.error('No se encontró el usuario con ID:', userId);
      showNotification({
        kind: 'error',
        domain: 'side',
        text: 'No se pudo encontrar el usuario para editar',
      });
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
    setFormError(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
    setFormError(null);
  };

  const handleToggleActive = async (row) => {
    try {
      const userToModify = usersData.customObjects.results.find(user => user.id === row.id);
      if (!userToModify) {
        throw new Error(`Usuario con ID ${row.id} no encontrado`);
      }

      const userData = typeof userToModify.value === 'string' 
        ? JSON.parse(userToModify.value) 
        : userToModify.value;
      
      // Cambiar el estado activo
      const updatedValue = {
        ...userData,
        active: userData.active ? false : true,
        updatedAt: new Date().toISOString(),
      };

      // Actualizar el usuario
      const { data: updateData } = await updateUser({
        variables: {
          key: userToModify.key,
          version: userToModify.version,
          value: JSON.stringify(updatedValue),
        },
      });

      if (updateData?.createOrUpdateCustomObject) {
        showNotification({
          kind: 'success',
          domain: 'page',
          text: intl.formatMessage(
            userData.active ? messages.userDeactivated : messages.userActivated
          ),
        });
        refetch();
      }
    } catch (error) {
      console.error('Error al cambiar estado activo:', error);
      showApiErrorNotification({
        errors: error,
        message: intl.formatMessage(messages.userUpdateError),
      });
    }
  };

  const handleSubmitForm = async (userData) => {
    try {
      // Validar la estructura de userData
      if (!userData || typeof userData !== 'object') {
        throw new Error('Datos de usuario inválidos');
      }
      
      // Log detallado del objeto userData para depuración
      console.log('Objeto userData completo:', JSON.stringify(userData, null, 2));
      console.log('userData.value es un string?', typeof userData.value === 'string');
      console.log('userData.id:', userData.id);
      console.log('userData.key:', userData.key);
      console.log('userData.version:', userData.version);
      console.log('userData.value:', userData.value);
      
      // Validar la estructura básica del objeto value
      if (!userData.value || typeof userData.value !== 'object') {
        throw new Error('Estructura de datos de usuario inválida (value)');
      }
      
      // Validar campos requeridos
      if (!userData.value.email) {
        throw new Error('El email es obligatorio');
      }
      
      if (!userData.value.name) {
        throw new Error('El nombre es obligatorio');
      }
      
      if (!Array.isArray(userData.value.roles) || userData.value.roles.length === 0) {
        throw new Error('Debe seleccionar al menos un rol');
      }
      
      // Validar el key
      if (!userData.key || typeof userData.key !== 'string') {
        throw new Error('Clave de usuario inválida');
      }
      
      if (userData.id) {
        // Validar versión para actualización
        if (typeof userData.version !== 'number') {
          throw new Error('Versión de objeto inválida para actualización');
        }
        
        console.log('Ejecutando mutación UpdateUser con variables:', {
          id: userData.id,
          version: userData.version,
          value: userData.value
        });
        
        console.log('userData.value antes de JSON.stringify:', userData.value);
        const valueAsString = JSON.stringify(userData.value);
        console.log('userData.value después de JSON.stringify:', valueAsString);
        
        console.log('Mutación GraphQL UpdateUser:');
        
        const updateResult = await updateUser({
          variables: {
            key: userData.key,
            version: userData.version,
            value: valueAsString,
          },
        });
        
        console.log('Resultado de la mutación UpdateUser:', JSON.stringify(updateResult, null, 2));
      } else {
        console.log('Ejecutando mutación CreateUser con variables:', {
          container: USER_CONTAINER,
          key: userData.key,
          value: userData.value,
          informacion: "El email ahora está en el campo value.email y el key es aleatorio"
        });
        
        console.log('userData.value antes de JSON.stringify (create):', userData.value);
        const createValueAsString = JSON.stringify(userData.value);
        console.log('userData.value después de JSON.stringify (create):', createValueAsString);
        
        const result = await createUser({
          variables: {
            container: USER_CONTAINER,
            key: userData.key,
            value: createValueAsString,
          },
        });
        
        console.log('Resultado de la mutación CreateUser:', JSON.stringify(result, null, 2));
      }
      
      console.log('Ejecutando refetch de FetchUsers después de crear/actualizar usuario');
      await refetch();
      
      showNotification({
        kind: 'success',
        domain: 'side',
        text: intl.formatMessage(messages.saveSuccess),
      });
      handleCloseForm();
    } catch (error) {
      console.error('Error saving user:', error);
      // Formatear el mensaje de error para hacerlo más amigable
      let errorMessage = error.message;
      
      // Detectar errores comunes en la respuesta de GraphQL
      if (errorMessage.includes('ConcurrentModification')) {
        errorMessage = 'El usuario ha sido modificado por alguien más. Por favor, recargue e intente de nuevo.';
      } else if (errorMessage.includes('DuplicateField')) {
        errorMessage = 'Ya existe un usuario con esa información. Por favor, use datos diferentes.';
      }
      
      setFormError(errorMessage);
      showApiErrorNotification({
        errors: [error],
      });
      throw error;
    }
  };

  return (
    <Spacings.Stack scale="xl">
      <Text.Headline as="h1">
        <FormattedMessage id="UserManagement.title" defaultMessage="User Management" />
      </Text.Headline>
      
      <Spacings.Stack scale="m">
        <Spacings.Inline justifyContent="space-between">
          <TextField
            name="search"
            value={searchTerm}
            onChange={handleSearchChange}
            title={intl.formatMessage(messages.searchLabel)}
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
            horizontalConstraint={13}
          />
          
          <PrimaryButton
            label={intl.formatMessage(messages.addUserButton)}
            onClick={handleAddUser}
          />
        </Spacings.Inline>
        
        <CollapsiblePanel
          header={intl.formatMessage(messages.filtersTitle)}
          scale="l"
        >
          <Card>
            <Spacings.Stack scale="m">
              <Constraints.Horizontal constraint="scale">
                <Spacings.Inline scale="m">
                  <SelectField
                    title={intl.formatMessage(messages.roleFilterLabel)}
                    name="role-filter"
                    value={roleFilter}
                    options={getRoleOptions(intl)}
                    onChange={handleRoleFilterChange}
                    horizontalConstraint={6}
                  />
                  
                  <SelectField
                    title={intl.formatMessage(messages.activeFilterLabel)}
                    name="status-filter"
                    value={statusFilter}
                    options={getStatusOptions(intl)}
                    onChange={handleStatusFilterChange}
                    horizontalConstraint={6}
                  />
                </Spacings.Inline>
              </Constraints.Horizontal>
            </Spacings.Stack>
          </Card>
        </CollapsiblePanel>
        
        <Text.Headline as="h2">
          {intl.formatMessage(messages.userListSubtitle, { count: totalUsers })}
        </Text.Headline>
        
        <DataTable
          columns={getColumns(intl, handleEdit, handleToggleActive)}
          rows={rows}
          maxHeight={600}
        />
        
        {totalUsers > 0 && (
          <Pagination
            page={page}
            onPageChange={handlePageChange}
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            totalItems={totalUsers}
          />
        )}
      </Spacings.Stack>
      
      {isFormOpen && (
        <UserForm
          isOpen={isFormOpen}
          user={selectedUser}
          channels={channelsPaginatedResult?.results || []}
          categories={categories || []}
          productSelections={productSelections || []}
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
          isLoading={createLoading || updateLoading}
          error={formError}
        />
      )}
    </Spacings.Stack>
  );
};

UserManagement.displayName = 'UserManagement';

export default UserManagement; 