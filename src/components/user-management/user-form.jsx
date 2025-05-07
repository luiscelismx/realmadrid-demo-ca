import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useFormik } from 'formik';
import {
  FormModalPage,
} from '@commercetools-frontend/application-components';
import TextField from '@commercetools-uikit/text-field';
import SelectField from '@commercetools-uikit/select-field';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import Spacings from '@commercetools-uikit/spacings';
import { ContentNotification } from '@commercetools-uikit/notifications';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import messages from './messages';

// Utilidades de conversión de datos
const userToFormValues = (user) => {
  if (!user) {
    return {
      email: '',
      name: '',
      roles: ['user'],
      providerIds: [],
      categoryIds: [],
      productSelectionIds: [],
      active: true,
    };
  }
  
  // Si value viene como string (JSON), parsearlo
  const value = typeof user.value === 'string' ? JSON.parse(user.value) : user.value;
  
  return {
    email: value.email || '',
    name: value.name,
    roles: value.roles || [],
    providerIds: value.providerIds || [],
    categoryIds: value.categoryIds || [],
    productSelectionIds: value.productSelectionIds || [],
    active: value.active,
  };
};

// Función para generar un ID aleatorio
const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

const formValuesToUser = (values, user) => {
  const userData = {
    key: user?.key || `user-${generateRandomId()}`,
    value: {
      email: values.email.toLowerCase(),
      name: values.name,
      roles: values.roles,
      providerIds: values.providerIds,
      categoryIds: values.categoryIds,
      productSelectionIds: values.productSelectionIds,
      active: values.active,
      updatedAt: new Date().toISOString(),
    },
  };
  
  if (!user) {
    // Si es un nuevo usuario, añadir fecha de creación
    userData.value.createdAt = new Date().toISOString();
  } else {
    // Mantener fecha de creación original si se está editando
    const userValue = typeof user.value === 'string' ? JSON.parse(user.value) : user.value;
    userData.value.createdAt = userValue.createdAt;
    // Añadir version para actualizar el objeto existente
    userData.version = user.version;
    userData.id = user.id;
  }
  
  return userData;
};

const UserDetailsForm = (props) => {
  const {
    initialValues,
    onSubmit,
    channels,
    categories,
    productSelections,
    isReadOnly,
    isCreating,
    children,
  } = props;

  const intl = useIntl();

  // Validación del formulario
  const validate = (values) => {
    const errors = {};
    
    // Validación de email
    if (!values.email) {
      errors.email = intl.formatMessage(messages.emailValidationError);
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = intl.formatMessage(messages.emailValidationError);
    }
    
    // Validación de nombre
    if (!values.name) {
      errors.name = intl.formatMessage(messages.nameValidationError);
    }
    
    // Validación de roles
    if (!values.roles || values.roles.length === 0) {
      errors.roles = intl.formatMessage(messages.rolesValidationError);
    }
    
    // Validación de proveedores
    if (!values.providerIds || values.providerIds.length === 0) {
      errors.providerIds = intl.formatMessage(messages.providersValidationError);
    }

    // Validación de categorías
    if (!values.categoryIds || values.categoryIds.length === 0) {
      errors.categoryIds = intl.formatMessage(messages.categoriesValidationError);
    }
    
    // Validación de selecciones de productos
    if (!values.productSelectionIds || values.productSelectionIds.length === 0) {
      errors.productSelectionIds = intl.formatMessage(messages.productSelectionsValidationError);
    }
    
    return errors;
  };

  // Opciones para los roles
  const roleOptions = [
    { value: 'admin', label: intl.formatMessage(messages.adminRole) },
    { value: 'user', label: intl.formatMessage(messages.userRole) },
  ];

  // Preparar opciones para los proveedores (channels)
  const channelOptions = channels.map(channel => ({
    value: channel.id,
    label: channel.name || channel.key || channel.id,
  }));

  // Preparar opciones para las categorías
  const categoryOptions = categories.map(category => {
    // Encontrar el nombre en español o usar el primer nombre disponible
    const nameEs = category.nameAllLocales?.find(name => name.locale === 'es')?.value;
    const nameDefault = category.nameAllLocales?.[0]?.value;
    return {
      value: category.id,
      label: nameEs || nameDefault || category.key || category.id,
    };
  });

  // Preparar opciones para las selecciones de productos
  const productSelectionOptions = productSelections.map(selection => {
    // Encontrar el nombre en español o usar el primer nombre disponible
    const nameEs = selection.nameAllLocales?.find(name => name.locale === 'es')?.value;
    const nameDefault = selection.nameAllLocales?.[0]?.value;
    return {
      value: selection.id,
      label: nameEs || nameDefault || selection.key || selection.id,
    };
  });

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit,
    enableReinitialize: true,
  });

  const formElements = (
    <Spacings.Stack scale="l">
      <TextField
        name="email"
        title={intl.formatMessage(messages.emailLabel)}
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        touched={formik.touched.email}
        errors={formik.errors.email ? [formik.errors.email] : []}
        isDisabled={isReadOnly || !isCreating} // Deshabilitar edición de email para usuarios existentes
        horizontalConstraint="scale"
      />

      <TextField
        name="name"
        title={intl.formatMessage(messages.nameLabel)}
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        touched={formik.touched.name}
        errors={formik.errors.name ? [formik.errors.name] : []}
        isDisabled={isReadOnly}
        horizontalConstraint="scale"
      />

      <SelectField
        name="roles"
        title={intl.formatMessage(messages.rolesLabel)}
        value={formik.values.roles}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        touched={formik.touched.roles}
        errors={formik.errors.roles ? [formik.errors.roles] : []}
        options={roleOptions}
        isMulti
        isDisabled={isReadOnly}
        horizontalConstraint="scale"
      />

      <SelectField
        name="providerIds"
        title={intl.formatMessage(messages.providersLabel)}
        value={formik.values.providerIds}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        touched={formik.touched.providerIds}
        errors={formik.errors.providerIds ? [formik.errors.providerIds] : []}
        options={channelOptions}
        isMulti
        isDisabled={isReadOnly}
        horizontalConstraint="scale"
      />

      <SelectField
        name="categoryIds"
        title={intl.formatMessage(messages.categoriesLabel)}
        value={formik.values.categoryIds}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        touched={formik.touched.categoryIds}
        errors={formik.errors.categoryIds ? [formik.errors.categoryIds] : []}
        options={categoryOptions}
        isMulti
        isDisabled={isReadOnly}
        horizontalConstraint="scale"
      />

      <SelectField
        name="productSelectionIds"
        title={intl.formatMessage(messages.productSelectionsLabel)}
        value={formik.values.productSelectionIds}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        touched={formik.touched.productSelectionIds}
        errors={formik.errors.productSelectionIds ? [formik.errors.productSelectionIds] : []}
        options={productSelectionOptions}
        isMulti
        isDisabled={isReadOnly}
        horizontalConstraint="scale"
      />

      <CheckboxInput
        name="active"
        value={formik.values.active}
        onChange={formik.handleChange}
        isChecked={formik.values.active}
        isDisabled={isReadOnly}
      >
        {intl.formatMessage(messages.activeLabel)}
      </CheckboxInput>
    </Spacings.Stack>
  );

  return children({
    formik,
    formElements,
    isDirty: formik.dirty,
    isSubmitting: formik.isSubmitting,
    handleSubmit: formik.handleSubmit,
    handleReset: formik.handleReset,
    values: formik.values,
  });
};

UserDetailsForm.displayName = 'UserDetailsForm';

UserDetailsForm.propTypes = {
  initialValues: PropTypes.shape({
    email: PropTypes.string,
    name: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string),
    providerIds: PropTypes.arrayOf(PropTypes.string),
    categoryIds: PropTypes.arrayOf(PropTypes.string),
    productSelectionIds: PropTypes.arrayOf(PropTypes.string),
    active: PropTypes.bool,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  channels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      key: PropTypes.string,
      name: PropTypes.string,
    })
  ).isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      key: PropTypes.string,
      nameAllLocales: PropTypes.array,
    })
  ).isRequired,
  productSelections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      key: PropTypes.string,
      nameAllLocales: PropTypes.array,
    })
  ).isRequired,
  isReadOnly: PropTypes.bool,
  isCreating: PropTypes.bool,
  children: PropTypes.func.isRequired,
};

UserDetailsForm.defaultProps = {
  isReadOnly: false,
  isCreating: false,
};

// Componente para mostrar detalles y edición de usuario
const UserForm = (props) => {
  const {
    user,
    channels,
    categories,
    productSelections,
    onClose,
    onSubmit,
    isOpen,
    isLoading,
    error,
  } = props;

  const intl = useIntl();
  const isCreating = !user;

  const handleSubmit = async (values, formikHelpers) => {
    try {
      await onSubmit(formValuesToUser(values, user));
    } catch (error) {
      formikHelpers.setSubmitting(false);
      // Aquí podríamos transformar errores si fuera necesario
      throw error;
    }
  };

  const initialValues = userToFormValues(user);

  return (
    <UserDetailsForm
      initialValues={initialValues}
      onSubmit={handleSubmit}
      channels={channels}
      categories={categories}
      productSelections={productSelections}
      isCreating={isCreating}
    >
      {(formProps) => {
        const title = intl.formatMessage(
          isCreating ? messages.createUserTitle : messages.editUserTitle
        );
        
        return (
          <FormModalPage
            title={title}
            isOpen={isOpen}
            onClose={onClose}
            isPrimaryButtonDisabled={
              formProps.isSubmitting || !formProps.isDirty
            }
            isSecondaryButtonDisabled={!formProps.isDirty}
            onSecondaryButtonClick={formProps.handleReset}
            onPrimaryButtonClick={formProps.handleSubmit}
            labelPrimaryButton={intl.formatMessage(messages.saveButton)}
            labelSecondaryButton={intl.formatMessage(messages.cancelButton)}
          >
            {isLoading && (
              <Spacings.Stack alignItems="center">
                <LoadingSpinner />
              </Spacings.Stack>
            )}
            {error && (
              <ContentNotification type="error">
                {error}
              </ContentNotification>
            )}
            {formProps.formElements}
          </FormModalPage>
        );
      }}
    </UserDetailsForm>
  );
};

UserForm.displayName = 'UserForm';

UserForm.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    key: PropTypes.string,
    version: PropTypes.number,
    value: PropTypes.object,
  }),
  channels: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  productSelections: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

UserForm.defaultProps = {
  isLoading: false,
  error: null,
};

export { userToFormValues, formValuesToUser };
export default UserForm; 