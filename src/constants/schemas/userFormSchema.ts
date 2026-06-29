import type { FormSchema } from '@app-types/formSchema';

/**
 * Declarative schema for the "Create User" form. The `SchemaForm` component
 * renders these sections/rows/fields and applies the field-level `validation`
 * rules declared here. Edit this file to change the form — no component changes
 * are required.
 */
export const userFormSchema: FormSchema = [
  {
    id: 'personalInformation',
    icon: 'User',
    title: { key: 'personalInformation', fallback: 'Personal Information' },
    rows: [
      {
        fields: [
          {
            name: 'firstName',
            type: 'text',
            autoFocus: true,
            required: true,
            label: { key: 'firstName', fallback: 'First Name' },
            placeholder: {
              key: 'firstNamePlaceholder',
              fallback: 'Enter first name',
            },
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.firstNameRequired',
                  fallback: 'First name is required',
                },
              },
              {
                rule: 'maxLength',
                value: 50,
                message: {
                  key: 'errors.firstNameMax',
                  fallback: 'First name is too long',
                },
              },
            ],
          },
          {
            name: 'lastName',
            type: 'text',
            required: true,
            label: { key: 'lastName', fallback: 'Last Name' },
            placeholder: {
              key: 'lastNamePlaceholder',
              fallback: 'Enter last name',
            },
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.lastNameRequired',
                  fallback: 'Last name is required',
                },
              },
              {
                rule: 'maxLength',
                value: 50,
                message: {
                  key: 'errors.lastNameMax',
                  fallback: 'Last name is too long',
                },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'email',
            type: 'email',
            required: true,
            icon: 'Mail',
            label: { key: 'email', fallback: 'Email Address' },
            placeholder: {
              key: 'emailPlaceholder',
              fallback: 'user@skillssa.co.za',
            },
            inputProps: {
              keyboardType: 'email-address',
              autoCapitalize: 'none',
            },
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.emailRequired',
                  fallback: 'Email address is required',
                },
              },
              {
                rule: 'email',
                message: {
                  key: 'errors.emailInvalid',
                  fallback: 'Enter a valid email address',
                },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'countryCode',
            type: 'select',
            required: false,
            label: { key: 'countryCode', fallback: 'Country Code' },
            placeholder: { fallback: '+27' },
            optionsSource: 'countryCodes',
            searchable: true,
          },
          {
            name: 'phoneNumber',
            type: 'tel',
            required: false,
            label: { key: 'phoneNumber', fallback: 'Phone Number' },
            placeholder: {
              key: 'phoneNumberPlaceholder',
              fallback: '000 000 000',
            },
            inputProps: { keyboardType: 'phone-pad', maxLength: 10 },
            validation: [
              {
                rule: 'pattern',
                value: '^[0-9]{10}$',
                message: {
                  key: 'errors.phoneInvalid',
                  fallback: 'Enter a valid 10-digit phone number',
                },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'alternativePhoneCode',
            type: 'select',
            required: false,
            label: { key: 'alternativeCountryCode', fallback: 'Alt Country Code' },
            placeholder: { fallback: '+27' },
            optionsSource: 'countryCodes',
            searchable: true,
          },
          {
            name: 'alternativePhone',
            type: 'tel',
            required: false,
            label: { key: 'alternativePhone', fallback: 'Alternative Phone' },
            placeholder: {
              key: 'alternativePhonePlaceholder',
              fallback: '000 000 000',
            },
            inputProps: { keyboardType: 'phone-pad', maxLength: 10 },
            validation: [
              {
                rule: 'pattern',
                value: '^[0-9]{10}$',
                message: {
                  key: 'errors.altPhoneInvalid',
                  fallback: 'Enter a valid 10-digit phone number',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'roleAndPermissions',
    icon: 'Shield',
    title: { key: 'roleAndPermissions', fallback: 'Role & Permissions' },
    rows: [
      {
        fields: [
          {
            name: 'roleId',
            type: 'select',
            required: true,
            zIndex: 1000,
            label: { key: 'role', fallback: 'Role' },
            placeholder: { key: 'rolePlaceholder', fallback: 'Select user role' },
            optionsSource: 'roles',
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.roleRequired',
                  fallback: 'Role is required',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'additionalInformation',
    icon: 'FileText',
    title: { key: 'additionalInformation', fallback: 'Additional Information' },
    rows: [
      {
        fields: [
          {
            name: 'gender',
            type: 'select',
            required: true,
            label: { key: 'gender', fallback: 'Gender' },
            placeholder: { fallback: 'Select gender' },
            optionsSource: 'genders',
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.genderRequired',
                  fallback: 'Gender is required',
                },
              },
            ],
          },
          {
            name: 'dob',
            type: 'date',
            required: true,
            zIndex: 999,
            label: { key: 'dob', fallback: 'DOB' },
            placeholder: { fallback: 'YYYY-MM-DD' },
            valueFormat: 'YYYY_MM_DD',
            displayFormat: 'YYYY-MM-DD',
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.dobRequired',
                  fallback: 'Date of birth is required',
                },
              },
              {
                rule: 'dateNotInFuture',
                message: {
                  key: 'errors.dobFuture',
                  fallback: 'Date of birth cannot be in the future',
                },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'username',
            type: 'text',
            required: true,
            label: { key: 'username', fallback: 'Username' },
            placeholder: { fallback: 'Enter username' },
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.usernameRequired',
                  fallback: 'Username is required',
                },
              },
              {
                rule: 'minLength',
                value: 3,
                message: {
                  key: 'errors.usernameMin',
                  fallback: 'Username must be at least 3 characters',
                },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'password',
            type: 'password',
            required: true,
            toggleVisibility: true,
            visibilityToggleGroup: 'userPassword',
            label: { key: 'password', fallback: 'Password' },
            placeholder: { fallback: 'Enter password' },
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.passwordRequired',
                  fallback: 'Password is required',
                },
              },
              {
                rule: 'minLength',
                value: 8,
                message: {
                  key: 'errors.passwordMin',
                  fallback: 'Password must be at least 8 characters',
                },
              },
            ],
          },
          {
            name: 'confirmPassword',
            type: 'password',
            required: true,
            toggleVisibility: true,
            visibilityToggleGroup: 'userPassword',
            label: { key: 'confirmPassword', fallback: 'Confirm Password' },
            placeholder: { fallback: 'Confirm password' },
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.confirmPasswordRequired',
                  fallback: 'Please confirm the password',
                },
              },
              {
                rule: 'matchField',
                value: 'password',
                message: {
                  key: 'errors.passwordMismatch',
                  fallback: 'Passwords do not match',
                },
              },
            ],
          },
        ],
      },
      {
        visibleWhen: { flag: 'isSupervisorOrLC' },
        fields: [
          {
            name: 'organisationId',
            type: 'select',
            required: true,
            label: { key: 'organisation', fallback: 'Organisation' },
            placeholder: {
              key: 'organisationPlaceholder',
              fallback: 'Select organisation',
            },
            optionsSource: 'organisations',
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.organisationRequired',
                  fallback: 'Organisation is required',
                },
              },
            ],
          },
          {
            name: 'positionId',
            type: 'select',
            required: true,
            label: { key: 'position', fallback: 'Position' },
            placeholder: {
              key: 'positionPlaceholder',
              fallback: 'Select position',
            },
            optionsSource: 'positions',
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.positionRequired',
                  fallback: 'Position is required',
                },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'employeeId',
            type: 'text',
            required: true,
            visibleWhen: { flag: 'isSupervisorOrLC' },
            label: { key: 'employeeId', fallback: 'Employee ID' },
            placeholder: {
              key: 'employeeIdPlaceholder',
              fallback: 'Enter Employee ID',
            },
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'errors.employeeIdRequired',
                  fallback: 'Employee ID is required',
                },
              },
            ],
          },
          {
            name: 'nationalId',
            type: 'text',
            required: false,
            label: { key: 'nationalId', fallback: 'National ID' },
            placeholder: {
              key: 'nationalIdPlaceholder',
              fallback: 'Enter National ID',
            },
            inputProps: { keyboardType: 'numeric' },
            validation: [
              {
                rule: 'pattern',
                value: '^[0-9]{13}$',
                message: {
                  key: 'errors.nationalIdInvalid',
                  fallback: 'National ID must be 13 digits',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'geographicAssignment',
    icon: 'MapPin',
    title: { key: 'geographicAssignment', fallback: 'Geographic Assignment' },
    rows: [
      {
        fields: [
          {
            name: 'provinceId',
            type: 'select',
            required: false,
            label: { key: 'province', fallback: 'Province' },
            placeholder: {
              key: 'provincePlaceholder',
              fallback: 'Select province',
            },
            optionsSource: 'provinces',
          },
          {
            name: 'siteId',
            type: 'select',
            required: false,
            dependsOn: 'provinceId',
            disabledWhen: { field: 'provinceId', empty: true },
            label: { key: 'site', fallback: 'Site' },
            placeholder: {
              key: 'sitePlaceholder',
              fallback: 'Select province first',
            },
            placeholderWhenReady: {
              key: 'sitePlaceholderReady',
              fallback: 'Select site',
            },
            optionsSource: 'sites',
          },
        ],
      },
    ],
  },
];

export default userFormSchema;
