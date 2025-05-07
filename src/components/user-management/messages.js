import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'UserManagement.title',
    defaultMessage: 'User Management',
  },
  userListSubtitle: {
    id: 'UserManagement.userListSubtitle',
    defaultMessage: '{count, plural, =0 {No users found} one {# user found} other {# users found}}',
  },
  fetchError: {
    id: 'UserManagement.fetchError',
    defaultMessage: 'An error occurred while fetching users.',
  },
  columnEmail: {
    id: 'UserManagement.column.email',
    defaultMessage: 'Email',
  },
  columnName: {
    id: 'UserManagement.column.name',
    defaultMessage: 'Name',
  },
  columnRoles: {
    id: 'UserManagement.column.roles',
    defaultMessage: 'Role(s)',
  },
  columnProviders: {
    id: 'UserManagement.column.providers',
    defaultMessage: 'Provider(s)',
  },
  columnCreatedAt: {
    id: 'UserManagement.column.createdAt',
    defaultMessage: 'Created At',
  },
  columnActive: {
    id: 'UserManagement.column.active',
    defaultMessage: 'Active',
  },
  // Search
  searchPlaceholder: {
    id: 'UserManagement.searchPlaceholder',
    defaultMessage: 'Search by email or name',
  },
  searchLabel: {
    id: 'UserManagement.searchLabel',
    defaultMessage: 'Search',
  },
  // Filters
  filtersTitle: {
    id: 'UserManagement.filtersTitle',
    defaultMessage: 'Filters',
  },
  roleFilterLabel: {
    id: 'UserManagement.roleFilterLabel',
    defaultMessage: 'Role',
  },
  activeFilterLabel: {
    id: 'UserManagement.activeFilterLabel',
    defaultMessage: 'Status',
  },
  dateFilterLabel: {
    id: 'UserManagement.dateFilterLabel',
    defaultMessage: 'Created after',
  },
  selectRole: {
    id: 'UserManagement.selectRole',
    defaultMessage: 'Select role',
  },
  selectStatus: {
    id: 'UserManagement.selectStatus',
    defaultMessage: 'Select status',
  },
  statusActive: {
    id: 'UserManagement.statusActive',
    defaultMessage: 'Active',
  },
  statusInactive: {
    id: 'UserManagement.statusInactive',
    defaultMessage: 'Inactive',
  },
  allRoles: {
    id: 'UserManagement.allRoles',
    defaultMessage: 'All roles',
  },
  allStatus: {
    id: 'UserManagement.allStatus',
    defaultMessage: 'All status',
  },
  adminRole: {
    id: 'UserManagement.adminRole',
    defaultMessage: 'Admin',
  },
  userRole: {
    id: 'UserManagement.userRole',
    defaultMessage: 'User',
  },
  // User Form
  userFormTitle: {
    id: 'UserManagement.userFormTitle',
    defaultMessage: 'User Details',
  },
  createUserTitle: {
    id: 'UserManagement.createUserTitle',
    defaultMessage: 'Create New User',
  },
  editUserTitle: {
    id: 'UserManagement.editUserTitle',
    defaultMessage: 'Edit User',
  },
  emailLabel: {
    id: 'UserManagement.emailLabel',
    defaultMessage: 'Email',
  },
  nameLabel: {
    id: 'UserManagement.nameLabel',
    defaultMessage: 'Name',
  },
  rolesLabel: {
    id: 'UserManagement.rolesLabel',
    defaultMessage: 'Roles',
  },
  providersLabel: {
    id: 'UserManagement.providersLabel',
    defaultMessage: 'Providers',
  },
  activeLabel: {
    id: 'UserManagement.activeLabel',
    defaultMessage: 'Active',
  },
  saveButton: {
    id: 'UserManagement.saveButton',
    defaultMessage: 'Save',
  },
  cancelButton: {
    id: 'UserManagement.cancelButton',
    defaultMessage: 'Cancel',
  },
  addUserButton: {
    id: 'UserManagement.addUserButton',
    defaultMessage: 'Add User',
  },
  emailValidationError: {
    id: 'UserManagement.emailValidationError',
    defaultMessage: 'Please enter a valid email address',
  },
  nameValidationError: {
    id: 'UserManagement.nameValidationError',
    defaultMessage: 'Please enter a name',
  },
  rolesValidationError: {
    id: 'UserManagement.rolesValidationError',
    defaultMessage: 'Please select at least one role',
  },
  providersValidationError: {
    id: 'UserManagement.providersValidationError',
    defaultMessage: 'Please select at least one provider',
  },
  saveSuccess: {
    id: 'UserManagement.saveSuccess',
    defaultMessage: 'User saved successfully',
  },
  saveError: {
    id: 'UserManagement.saveError',
    defaultMessage: 'Error saving user',
  },
  categoriesLabel: {
    id: 'UserManagement.label.categories',
    defaultMessage: 'Categories',
  },
  categoriesValidationError: {
    id: 'UserManagement.error.categories',
    defaultMessage: 'At least one category is required',
  },
  column: {
    categories: {
      id: 'UserManagement.column.categories',
      defaultMessage: 'Categories',
    },
    productSelections: {
      id: 'UserManagement.column.productSelections',
      defaultMessage: 'Product Selections',
    },
  },
  productSelectionsLabel: {
    id: 'UserManagement.label.productSelections',
    defaultMessage: 'Product Selections',
  },
  productSelectionsValidationError: {
    id: 'UserManagement.error.productSelections',
    defaultMessage: 'At least one product selection is required',
  },
  // Add more messages here as needed
}); 