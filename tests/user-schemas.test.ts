import {
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
  USER_ROLES,
  USER_STATUS,
  ACCOUNT_TYPES
} from '../src/schemas/user-schemas';
import { MsgType } from '../src/schemas/msg-type';
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
        expect(() => customSchema.parse('Short1!')).toThrow('Password must be at least 12 characters long');
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
        expect(() => customSchema.parse('weak')).toThrow('Secret must be at least 8 characters long');
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
        expect(() => customSchema.parse('user')).toThrow('Username must be at least 5 characters long');
      });

      it('should accept username with custom maximum length', () => {
        const customSchema = zUsername('Username', MsgType.FieldName, 3, 10);
        expect(customSchema.parse('username12')).toBe('username12');
      });

      it('should reject username above custom maximum length', () => {
        const customSchema = zUsername('Username', MsgType.FieldName, 3, 10);
        expect(() => customSchema.parse('verylongusername')).toThrow('Username must be at most 10 characters long');
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
