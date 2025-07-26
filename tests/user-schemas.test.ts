import { createUserSchemas, USER_ROLES, USER_STATUS, ACCOUNT_TYPES } from '../src/schemas/user-schemas';
import { MsgType } from '../src/common/types/msg-type';
import { createTestMessageHandler } from '../src/localization/message-handler.types';

// Create mock message handler instance
const messageHandler = createTestMessageHandler();

// Create schema instances using factory
const {
  zPassword,
  zUsername,
  zDisplayName,
  zUserRegistration,
  zUserLogin,
  zUserOptional,
  zUserRequired,
  zUserUpdate,
  zPasswordChange,
  zPasswordReset,
  zAdminUserManagement,
  // New schemas
  zPasswordWithWeaknessCheck,
  zUserGenericValidation,
  zEmailUniqueness,
  zUsernameUniqueness,
  zRoleValidation,
  zAccountTypeValidation,
  zUserRegistrationWithUniqueness,
} = createUserSchemas(messageHandler);
import { runTableTests } from './setup';

describe('User Schemas', () => {
  describe('zPassword', () => {
    const schema = zPassword();

    runTableTests([
      {
        description: 'should validate a strong password',
        input: 'StrongPass1!',
        expected: 'StrongPass1!'
      },
      {
        description: 'should accept password with all required elements',
        input: 'ValidPass123@',
        expected: 'ValidPass123@'
      },
      {
        description: 'should reject password without uppercase',
        input: 'weakpass1!',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject password without lowercase',
        input: 'WEAKPASS1!',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject password without numbers',
        input: 'Weakpass!',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject password without special characters',
        input: 'Weakpass1',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject password too short',
        input: 'Pass1!',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject empty password',
        input: '',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Custom requirements', () => {
      it('should accept password with custom minimum length', () => {
        const customSchema = zPassword('Password', MsgType.FieldName, 12);
        expect(customSchema.parse('LongPassword123!')).toBe('LongPassword123!');
      });

      it('should reject password below custom minimum length', () => {
        const customSchema = zPassword('Password', MsgType.FieldName, 12);
        expect(() => customSchema.parse('Short1!')).toThrow('Password password is too short (minimum: 12 characters)');
      });

      it('should allow passwords without uppercase when not required', () => {
        const customSchema = zPassword('Password', MsgType.FieldName, 8, false);
        expect(customSchema.parse('lowercase1!')).toBe('lowercase1!');
      });

      it('should allow passwords without special characters when not required', () => {
        const customSchema = zPassword('Password', MsgType.FieldName, 8, true, true, true, false);
        expect(customSchema.parse('ValidPass123')).toBe('ValidPass123');
      });
    });

    describe('Error messages', () => {
      it('should use custom field name in error messages', () => {
        const customSchema = zPassword('Secret');
        expect(() => customSchema.parse('weak')).toThrow('Secret password is too short (minimum: 8 characters)');
      });

      it('should use custom message when msgType is Message', () => {
        const customSchema = zPassword('Password is invalid', MsgType.Message);
        expect(() => customSchema.parse('weak')).toThrow('Password is invalid');
      });
    });
  });

  describe('zUsername', () => {
    const schema = zUsername();

    runTableTests([
      {
        description: 'should validate a proper username',
        input: 'valid_username',
        expected: 'valid_username'
      },
      {
        description: 'should accept username with numbers',
        input: 'user123',
        expected: 'user123'
      },
      {
        description: 'should accept username with hyphens',
        input: 'user-name',
        expected: 'user-name'
      },
      {
        description: 'should accept username with underscores',
        input: 'user_name',
        expected: 'user_name'
      },
      {
        description: 'should reject username too short',
        input: 'us',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject username too long',
        input: 'a'.repeat(31),
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject username with invalid characters',
        input: 'invalid!user',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject username starting with underscore',
        input: '_username',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject username ending with underscore',
        input: 'username_',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject username starting with hyphen',
        input: '-username',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject username ending with hyphen',
        input: 'username-',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject empty username',
        input: '',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    describe('Custom length requirements', () => {
      it('should accept username with custom minimum length', () => {
        const customSchema = zUsername('Username', MsgType.FieldName, 5);
        expect(customSchema.parse('valid')).toBe('valid');
      });

      it('should reject username below custom minimum length', () => {
        const customSchema = zUsername('Username', MsgType.FieldName, 5);
        expect(() => customSchema.parse('user')).toThrow('Username is too short (minimum: 5 characters)');
      });

      it('should accept username with custom maximum length', () => {
        const customSchema = zUsername('Username', MsgType.FieldName, 3, 10);
        expect(customSchema.parse('username12')).toBe('username12');
      });

      it('should reject username above custom maximum length', () => {
        const customSchema = zUsername('Username', MsgType.FieldName, 3, 10);
        expect(() => customSchema.parse('verylongusername')).toThrow('Username is too long (maximum: 10 characters)');
      });
    });
  });

  describe('zDisplayName', () => {
    const schema = zDisplayName();

    runTableTests([
      {
        description: 'should accept valid display name',
        input: 'John Doe',
        expected: 'John Doe'
      },
      {
        description: 'should accept display name with special characters',
        input: 'John O\'Connor',
        expected: 'John O\'Connor'
      },
      {
        description: 'should accept empty display name',
        input: '',
        expected: ''
      },
      {
        description: 'should accept undefined display name',
        input: undefined,
        expected: ''
      },
      {
        description: 'should reject display name too long',
        input: 'a'.repeat(51),
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should trim whitespace-only display name to empty string',
        input: '   ',
        expected: ''
      }
    ], (input) => schema.parse(input));
  });

  describe('zUserRegistration', () => {
    const schema = zUserRegistration();

    const validRegistration = {
      username: 'johndoe',
      email: 'john@example.com',
      password: 'StrongPass1!',
      confirmPassword: 'StrongPass1!',
      acceptTerms: true
    };

    runTableTests([
      {
        description: 'should validate complete user registration',
        input: validRegistration,
        expected: expect.objectContaining({
          username: 'johndoe',
          email: 'john@example.com',
          password: 'StrongPass1!',
          acceptTerms: true
        })
      },
      {
        description: 'should validate registration with optional fields',
        input: {
          ...validRegistration,
          displayName: 'John Doe',
          firstName: 'John',
          lastName: 'Doe'
        },
        expected: expect.objectContaining({
          username: 'johndoe',
          displayName: 'John Doe',
          firstName: 'John',
          lastName: 'Doe'
        })
      },
      {
        description: 'should reject registration with mismatched passwords',
        input: {
          ...validRegistration,
          confirmPassword: 'DifferentPass1!'
        },
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject registration without accepting terms',
        input: {
          ...validRegistration,
          acceptTerms: false
        },
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject registration with invalid email',
        input: {
          ...validRegistration,
          email: 'invalid-email'
        },
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject registration with weak password',
        input: {
          ...validRegistration,
          password: 'weak',
          confirmPassword: 'weak'
        },
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('zUserLogin', () => {
    const schema = zUserLogin();

    runTableTests([
      {
        description: 'should validate login with username',
        input: {
          identifier: 'johndoe',
          password: 'password123'
        },
        expected: expect.objectContaining({
          identifier: 'johndoe',
          password: 'password123'
        })
      },
      {
        description: 'should validate login with email',
        input: {
          identifier: 'john@example.com',
          password: 'password123'
        },
        expected: expect.objectContaining({
          identifier: 'john@example.com',
          password: 'password123'
        })
      },
      {
        description: 'should validate login with rememberMe',
        input: {
          identifier: 'johndoe',
          password: 'password123',
          rememberMe: true
        },
        expected: expect.objectContaining({
          identifier: 'johndoe',
          password: 'password123',
          rememberMe: true
        })
      },
      {
        description: 'should reject login without identifier',
        input: {
          password: 'password123'
        },
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject login without password',
        input: {
          identifier: 'johndoe'
        },
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('zPasswordChange', () => {
    const schema = zPasswordChange();

    runTableTests([
      {
        description: 'should validate password change',
        input: {
          currentPassword: 'OldPass123!',
          newPassword: 'NewPass123!',
          confirmPassword: 'NewPass123!'
        },
        expected: expect.objectContaining({
          currentPassword: 'OldPass123!',
          newPassword: 'NewPass123!',
          confirmPassword: 'NewPass123!'
        })
      },
      {
        description: 'should reject password change with mismatched new passwords',
        input: {
          currentPassword: 'OldPass123!',
          newPassword: 'NewPass123!',
          confirmPassword: 'DifferentPass123!'
        },
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject password change where new password equals current',
        input: {
          currentPassword: 'SamePass123!',
          newPassword: 'SamePass123!',
          confirmPassword: 'SamePass123!'
        },
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject password change with weak new password',
        input: {
          currentPassword: 'OldPass123!',
          newPassword: 'weak',
          confirmPassword: 'weak'
        },
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('zPasswordReset', () => {
    const schema = zPasswordReset();

    runTableTests([
      {
        description: 'should validate password reset request',
        input: {
          email: 'john@example.com'
        },
        expected: expect.objectContaining({
          email: 'john@example.com'
        })
      },
      {
        description: 'should reject password reset with invalid email',
        input: {
          email: 'invalid-email'
        },
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject password reset without email',
        input: {},
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('zUserRequired', () => {
    const schema = zUserRequired();

    const validUser = {
      id: 'user123',
      username: 'johndoe',
      email: 'john@example.com',
      role: 'user' as const,
      status: 'active' as const
    };

    runTableTests([
      {
        description: 'should validate complete user object',
        input: validUser,
        expected: expect.objectContaining(validUser)
      },
      {
        description: 'should validate user with optional fields',
        input: {
          ...validUser,
          displayName: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          accountType: 'individual' as const,
          bio: 'Software developer'
        },
        expected: expect.objectContaining({
          ...validUser,
          displayName: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          accountType: 'individual',
          bio: 'Software developer'
        })
      },
      {
        description: 'should reject user without required fields',
        input: {
          username: 'johndoe',
          email: 'john@example.com'
        },
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject user with invalid role',
        input: {
          ...validUser,
          role: 'invalid_role'
        },
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject user with invalid status',
        input: {
          ...validUser,
          status: 'invalid_status'
        },
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('zUserUpdate', () => {
    const schema = zUserUpdate();

    runTableTests([
      {
        description: 'should validate user update with all fields',
        input: {
          displayName: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Software developer'
        },
        expected: expect.objectContaining({
          displayName: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Software developer'
        })
      },
      {
        description: 'should validate partial user update',
        input: {
          displayName: 'John Doe'
        },
        expected: expect.objectContaining({
          displayName: 'John Doe'
        })
      },
      {
        description: 'should validate empty user update',
        input: {},
        expected: expect.objectContaining({})
      },
      {
        description: 'should reject user update with invalid display name',
        input: {
          displayName: 'a'.repeat(51)
        },
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('zAdminUserManagement', () => {
    const schema = zAdminUserManagement();

    runTableTests([
      {
        description: 'should validate admin user management',
        input: {
          userId: 'user123',
          role: 'admin' as const,
          status: 'active' as const,
          reason: 'Role update'
        },
        expected: expect.objectContaining({
          userId: 'user123',
          role: 'admin',
          status: 'active',
          reason: 'Role update'
        })
      },
      {
        description: 'should validate admin user management with minimal fields',
        input: {
          userId: 'user123'
        },
        expected: expect.objectContaining({
          userId: 'user123'
        })
      },
      {
        description: 'should reject admin user management without userId',
        input: {
          role: 'admin' as const
        },
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject admin user management with invalid role',
        input: {
          userId: 'user123',
          role: 'invalid_role'
        },
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  // New schema tests
  describe('zPasswordWithWeaknessCheck', () => {
    const schema = zPasswordWithWeaknessCheck();

    runTableTests([
      {
        description: 'should accept very strong password',
        input: 'VeryStrongPass123!@#',
        expected: 'VeryStrongPass123!@#'
      },
      {
        description: 'should accept strong password',
        input: 'StrongPass123!',
        expected: 'StrongPass123!'
      },
      {
        description: 'should reject weak password',
        input: 'weak',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject moderately weak password',
        input: 'password123',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    it('should use passwordWeak message key', () => {
      expect(() => schema.parse('weak')).toThrow('Password password is weak (score: 2)');
    });
  });

  describe('zUserGenericValidation', () => {
    const schema = zUserGenericValidation();

    runTableTests([
      {
        description: 'should accept valid user object with id',
        input: { id: 'user123', name: 'John' },
        expected: { id: 'user123', name: 'John' }
      },
      {
        description: 'should accept minimal user object with id',
        input: { id: 'user456' },
        expected: { id: 'user456' }
      },
      {
        description: 'should reject object without id',
        input: { name: 'John', email: 'john@example.com' },
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject non-object values',
        input: 'not an object',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject null value',
        input: null,
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('zEmailUniqueness', () => {
    const existingEmails = ['john@example.com', 'jane@example.com'];
    const schema = zEmailUniqueness('Email', MsgType.FieldName, existingEmails);

    runTableTests([
      {
        description: 'should accept unique email',
        input: 'new@example.com',
        expected: 'new@example.com'
      },
      {
        description: 'should accept email with different case that is unique',
        input: 'UNIQUE@example.com',
        expected: 'UNIQUE@example.com'
      },
      {
        description: 'should reject existing email (case-insensitive)',
        input: 'john@example.com',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject existing email with different case',
        input: 'JOHN@EXAMPLE.COM',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject invalid email format',
        input: 'invalid-email',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    it('should use emailAlreadyExists message key', () => {
      expect(() => schema.parse('john@example.com')).toThrow('Email email address is already in use');
    });
  });

  describe('zUsernameUniqueness', () => {
    const existingUsernames = ['johndoe', 'janedoe'];
    const schema = zUsernameUniqueness('Username', MsgType.FieldName, existingUsernames);

    runTableTests([
      {
        description: 'should accept unique username',
        input: 'newuser',
        expected: 'newuser'
      },
      {
        description: 'should accept username with different case that is unique',
        input: 'UNIQUEUSER',
        expected: 'UNIQUEUSER'
      },
      {
        description: 'should reject existing username (case-insensitive)',
        input: 'johndoe',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject existing username with different case',
        input: 'JOHNDOE',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject username with invalid characters',
        input: 'invalid@user',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    it('should use usernameAlreadyExists message key', () => {
      expect(() => schema.parse('johndoe')).toThrow('Username username is already taken');
    });
  });

  describe('zRoleValidation', () => {
    const schema = zRoleValidation();

    runTableTests([
      {
        description: 'should accept valid role - admin',
        input: 'admin',
        expected: 'admin'
      },
      {
        description: 'should accept valid role - user',
        input: 'user',
        expected: 'user'
      },
      {
        description: 'should accept valid role - moderator',
        input: 'moderator',
        expected: 'moderator'
      },
      {
        description: 'should reject invalid role',
        input: 'invalid_role',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject empty role',
        input: '',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    it('should use invalidRole message key', () => {
      expect(() => schema.parse('invalid_role')).toThrow('Role has invalid role: invalid_role');
    });
  });

  describe('zAccountTypeValidation', () => {
    const schema = zAccountTypeValidation();

    runTableTests([
      {
        description: 'should accept valid account type - individual',
        input: 'individual',
        expected: 'individual'
      },
      {
        description: 'should accept valid account type - business',
        input: 'business',
        expected: 'business'
      },
      {
        description: 'should accept valid account type - organization',
        input: 'organization',
        expected: 'organization'
      },
      {
        description: 'should reject invalid account type',
        input: 'invalid_type',
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject empty account type',
        input: '',
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));

    it('should use invalidAccountType message key', () => {
      expect(() => schema.parse('invalid_type')).toThrow('Account Type has invalid account type: invalid_type');
    });
  });

  describe('zUserRegistrationWithUniqueness', () => {
    const existingEmails = ['john@example.com'];
    const existingUsernames = ['johndoe'];
    const schema = zUserRegistrationWithUniqueness('Registration', MsgType.FieldName, existingEmails, existingUsernames);

    const validRegistration = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'VeryStrongPass123!',
      confirmPassword: 'VeryStrongPass123!',
      accountType: 'individual' as const,
      acceptTerms: true
    };

    runTableTests([
      {
        description: 'should validate complete enhanced registration',
        input: validRegistration,
        expected: expect.objectContaining({
          username: 'newuser',
          email: 'new@example.com',
          accountType: 'individual',
          acceptTerms: true
        })
      },
      {
        description: 'should reject registration with existing email',
        input: {
          ...validRegistration,
          email: 'john@example.com'
        },
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject registration with existing username',
        input: {
          ...validRegistration,
          username: 'johndoe'
        },
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject registration with weak password',
        input: {
          ...validRegistration,
          password: 'weak',
          confirmPassword: 'weak'
        },
        expected: new Error(),
        shouldThrow: true
      },
      {
        description: 'should reject registration with invalid account type',
        input: {
          ...validRegistration,
          accountType: 'invalid_type'
        },
        expected: new Error(),
        shouldThrow: true
      }
    ], (input) => schema.parse(input));
  });

  describe('Message customization tests', () => {
    it('all new schemas support custom field names and message types', () => {
      const testCases = [
        { schema: zPasswordWithWeaknessCheck, name: 'Password Strength', invalid: 'weak' },
        { schema: zUserGenericValidation, name: 'User Object', invalid: 'not-object' },
        { schema: zRoleValidation, name: 'User Role', invalid: 'invalid_role' },
        { schema: zAccountTypeValidation, name: 'Account Type', invalid: 'invalid_type' },
      ];

      testCases.forEach(({ schema, name, invalid }) => {
        // Test custom field name
        const fieldNameSchema = schema(`Custom ${name}`);
        expect(() => fieldNameSchema.parse(invalid)).toThrow(`Custom ${name}`);

        // Test custom message
        const messageSchema = schema(`Custom error for ${name}`, MsgType.Message);
        expect(() => messageSchema.parse(invalid)).toThrow(`Custom error for ${name}`);
      });
    });
  });

  describe('Constants', () => {
    it('should have valid user roles', () => {
      expect(USER_ROLES).toContain('admin');
      expect(USER_ROLES).toContain('user');
      expect(USER_ROLES).toContain('guest');
    });

    it('should have valid user statuses', () => {
      expect(USER_STATUS).toContain('active');
      expect(USER_STATUS).toContain('inactive');
      expect(USER_STATUS).toContain('suspended');
    });

    it('should have valid account types', () => {
      expect(ACCOUNT_TYPES).toContain('individual');
      expect(ACCOUNT_TYPES).toContain('business');
      expect(ACCOUNT_TYPES).toContain('organization');
    });
  });
});
