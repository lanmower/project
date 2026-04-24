import { DynamicForm } from './DynamicForm';

const formFields = [
  {
    name: 'username',
    label: 'Username',
    type: 'text' as const,
    required: true,
    validation: {
      minLength: 3,
      maxLength: 20
    },
    placeholder: 'Enter your username'
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email' as const,
    required: true,
    description: 'We will never share your email'
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select' as const,
    options: [
      { label: 'User', value: 'user' },
      { label: 'Admin', value: 'admin' },
      { label: 'Manager', value: 'manager' }
    ],
    required: true
  },
  {
    name: 'bio',
    label: 'Bio',
    type: 'textarea' as const,
    placeholder: 'Tell us about yourself',
    validation: {
      maxLength: 500
    }
  },
  {
    name: 'newsletter',
    label: 'Subscribe to newsletter',
    type: 'checkbox' as const,
    description: 'Receive updates about our products'
  }
];

export function FormExample() {
  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
  };

  return (
    <DynamicForm
      fields={formFields}
      onSubmit={handleSubmit}
      defaultValues={{
        newsletter: true
      }}
    />
  );
}
