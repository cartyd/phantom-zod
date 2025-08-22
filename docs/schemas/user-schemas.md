# User Schemas

The user schemas module provides comprehensive validation for user-related data including authentication, registration, profile management, password security, and administrative operations with role-based access controls.

## Overview

This module offers robust user validation with support for secure password policies, username format validation, email verification, user profiles with display names and avatars, role assignments, account type management, and administrative user operations. It's designed for applications requiring sophisticated user management systems with security-first validation.

## Usage Patterns

### String Parameter Overloads (v1.5+)

Starting in v1.5, user schemas support simplified string parameter usage for basic field name specification:

```typescript
// Traditional options object
const userTraditional = pz.UserOptional({ msg: "User Profile" });

// Simplified string parameter (equivalent)
const userSimple = pz.UserOptional("User Profile");

// Both produce the same validation behavior
const userInput = { id: "123", email: "test@example.com", username: "testuser" };
userTraditional.parse(userInput); // ✅ Valid user object
userSimple.parse(userInput);      // ✅ Valid user object

// Error messages are identical
userTraditional.parse({ email: "invalid" }); // ❌ "User Profile email must be a valid email"
userSimple.parse({ email: "invalid" });      // ❌ "User Profile email must be a valid email"
```

**When to use string parameters:**
- Basic field name specification only
- Default validation behavior is sufficient
- Cleaner, more concise code

**When to use options objects:**
- Complex password requirements needed
- Custom message types (`MsgType.Message`)
- Advanced localization configurations

**Note:** Some specialized user schemas have complex parameters and may not support string overloads in the same way as basic schemas.

## Available Schemas

### Core User Schemas

- **`UserOptional(msg?, msgType?)`** - Basic user schema with optional fields
- **`UserFactory()`** - Factory for creating customized user schemas

### Password Schemas

- **`PasswordSecure(msg?, msgType?, minLength?, maxLength?, requireNumbers?, requireSymbols?, requireUppercase?, requireLowercase?)`** - Secure password validation with complexity requirements
- **`PasswordChange(msg?, msgType?)`** - Password change validation with current/new password
- **`PasswordReset(msg?, msgType?)`** - Password reset validation with token verification
- **`PasswordStrength(msg?, msgType?)`** - Password strength validation with scoring

### Username Schemas

- **`UsernameSecure(msg?, msgType?, minLength?, maxLength?, allowNumbers?, allowUnderscore?, allowHyphens?)`** - Username validation with format restrictions
- **`UsernameAvailable(msg?, msgType?)`** - Username availability check
- **`UsernameUpdate(msg?, msgType?)`** - Username update validation

### User Registration & Authentication

- **`UserRegistration(msg?, msgType?, requireEmailVerification?, requireTermsAcceptance?)`** - Complete user registration validation
- **`UserLogin(msg?, msgType?, allowUsername?, allowEmail?)`** - User login validation
- **`UserLoginWithRemember(msg?, msgType?)`** - Login with remember me option
- **`UserProfile(msg?, msgType?, requireDisplayName?, allowBio?, allowAvatar?)`** - User profile validation
- **`UserProfileUpdate(msg?, msgType?)`** - User profile update validation

### Administrative Schemas

- **`AdminUserManagement(msg?, msgType?)`** - Administrative user management operations
- **`UserRoleAssignment(msg?, msgType?)`** - Role assignment validation
- **`UserAccountStatus(msg?, msgType?)`** - Account status management
- **`UserAccountType(msg?, msgType?)`** - Account type validation

### Uniqueness & Validation

- **`EmailUnique(msg?, msgType?)`** - Email uniqueness validation
- **`UsernameUnique(msg?, msgType?)`** - Username uniqueness validation
- **`FullUserRegistrationUnique(msg?, msgType?)`** - Complete registration with uniqueness checks

## User Constants

```typescript
// User roles (exported as USER_ROLES)
const USER_ROLES = [
  'admin',
  'moderator', 
  'user',
  'guest'
] as const;

// User statuses (exported as USER_STATUSES)
const USER_STATUSES = [
  'active',
  'inactive', 
  'suspended',
  'pending',
  'banned'
] as const;

// Account types (exported as ACCOUNT_TYPES)
const ACCOUNT_TYPES = [
  'personal',
  'business',
  'enterprise',
  'nonprofit'
] as const;
```

## Examples

### Basic User Validation

```typescript
import { pz } from 'phantom-zod';

// Basic optional user schema
const basicUserSchema = pz.UserOptional();
const validUser = basicUserSchema.parse({
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "user@example.com",
  username: "johndoe",
  displayName: "John Doe",
  role: "user",
  status: "active"
}); // ✓ Valid

// Custom user schema using factory
const customUserFactory = pz.UserFactory();
const customUserSchema = customUserFactory({
  includeAvatar: true,
  includeBio: true,
  requireDisplayName: true
});

const customUser = customUserSchema.parse({
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "user@example.com",
  username: "johndoe", 
  displayName: "John Doe",
  bio: "Software developer with a passion for clean code",
  avatar: "https://example.com/avatars/johndoe.jpg",
  role: "user",
  status: "active"
}); // ✓ Valid
```

### User Registration

```typescript
import { pz } from 'phantom-zod';

const registrationSchema = pz.UserRegistration();

// Valid registration
const registration = registrationSchema.parse({
  username: "new_user",
  email: "user@example.com",
  password: "SecureP@ss123",
  confirmPassword: "SecureP@ss123",
  displayName: "New User",
  firstName: "New",
  lastName: "User",
  acceptTerms: true
}); // ✓ Valid

// Invalid - passwords don't match
registrationSchema.parse({
  username: "new_user",
  email: "user@example.com", 
  password: "SecureP@ss123",
  confirmPassword: "DifferentP@ss456", // ✗ Error
  acceptTerms: true
}); // ✗ Error: Passwords do not match
```

### Password Validation

```typescript
import { pz } from 'phantom-zod';

// Secure password validation with complexity requirements
const passwordSchema = pz.PasswordSecure();
passwordSchema.parse("SecureP@ss123!"); // ✓ Valid
passwordSchema.parse("weak");            // ✗ Error: Too short

// Password strength validation with scoring
const strengthSchema = pz.PasswordStrength();
const result = strengthSchema.parse("MyVerySecure123!");
// Returns: { password: "MyVerySecure123!", strength: 85, level: "strong" }

// Custom password requirements
const customPasswordSchema = pz.PasswordSecure({
  msg: "Custom Password",
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: false
});
```

### Username Validation

```typescript
import { pz } from 'phantom-zod';

// Secure username validation with format restrictions
const usernameSchema = pz.UsernameSecure({ msg: "Username" });
usernameSchema.parse("john_doe");    // ✓ Valid
usernameSchema.parse("user123");     // ✓ Valid
usernameSchema.parse("test-user");   // ✓ Valid
usernameSchema.parse("_invalid");    // ✗ Error: Cannot start with underscore
usernameSchema.parse("user@name");   // ✗ Error: Invalid characters

// Username uniqueness validation
const uniqueUsernameSchema = pz.UsernameUnique({ msg: "Username" });
const result = uniqueUsernameSchema.parse({
  username: "new_user",
  available: true
}); // ✓ Valid

const duplicateResult = uniqueUsernameSchema.parse({
  username: "john_doe",
  available: false,
  suggestions: ["john_doe1", "john_doe2024"]
}); // ✓ Valid (but username is taken)
```

### User Authentication

```typescript
import { pz } from 'phantom-zod';

// Login validation
const loginSchema = pz.UserLogin();
const loginData = loginSchema.parse({
  identifier: "john_doe", // Can be username or email
  password: "userPassword123",
  rememberMe: true
}); // ✓ Valid

// Login with remember me option
const rememberLoginSchema = pz.UserLoginWithRemember();
const rememberLoginData = rememberLoginSchema.parse({
  identifier: "user@example.com",
  password: "UserPassword123!",
  rememberMe: true,
  deviceName: "My iPhone", // Optional device identification
  expiresIn: 2592000 // 30 days in seconds
}); // ✓ Valid

// Password change validation
const passwordChangeSchema = pz.PasswordChange();
const changeData = passwordChangeSchema.parse({
  currentPassword: "oldPassword123",
  newPassword: "NewSecureP@ss456", 
  confirmPassword: "NewSecureP@ss456"
}); // ✓ Valid

// Password reset process
const passwordResetSchema = pz.PasswordReset();
// Step 1: Request password reset
const resetRequest = passwordResetSchema.parse({
  email: "user@example.com",
  step: "request"
}); // ✓ Valid

// Step 2: Verify reset token
const resetVerify = passwordResetSchema.parse({
  email: "user@example.com",
  resetToken: "abc123def456ghi789",
  step: "verify"
}); // ✓ Valid

// Step 3: Set new password
const resetComplete = passwordResetSchema.parse({
  email: "user@example.com",
  resetToken: "abc123def456ghi789",
  newPassword: "NewSecurePassword123!",
  confirmPassword: "NewSecurePassword123!",
  step: "complete"
}); // ✓ Valid
```

### User Profile Updates

```typescript
import { pz } from 'phantom-zod';

// User profile validation
const profileSchema = pz.UserProfile();
const profile = profileSchema.parse({
  displayName: "John Doe",
  bio: "Software developer and tech enthusiast",
  avatar: "https://example.com/avatars/johndoe.jpg",
  location: "San Francisco, CA",
  website: "https://johndoe.dev",
  socialLinks: {
    twitter: "https://twitter.com/johndoe",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe"
  },
  preferences: {
    theme: "dark",
    notifications: true,
    privacy: "public"
  }
}); // ✓ Valid

// Profile update validation
const profileUpdateSchema = pz.UserProfileUpdate();
const profileUpdate = profileUpdateSchema.parse({
  displayName: "John Smith", // Updated name
  bio: "Senior Software Engineer",
  location: "New York, NY",
  preferences: {
    theme: "light",
    notifications: false
  },
  updatedFields: ["displayName", "bio", "location", "preferences"]
}); // ✓ Valid
```

### Administrative Operations

```typescript
import { pz } from 'phantom-zod';

// Administrative user management
const adminSchema = pz.AdminUserManagement();
const adminAction = adminSchema.parse({
  targetUserId: "550e8400-e29b-41d4-a716-446655440000",
  action: "suspend",
  reason: "Violation of community guidelines",
  duration: 604800, // 7 days in seconds
  adminId: "660f8400-e29b-41d4-a716-446655440001",
  notifyUser: true,
  internalNotes: "First warning for spam behavior"
}); // ✓ Valid

// Role assignment
const roleAssignmentSchema = pz.UserRoleAssignment();
const roleAssignment = roleAssignmentSchema.parse({
  userId: "550e8400-e29b-41d4-a716-446655440000",
  newRole: "moderator",
  previousRole: "user",
  assignedBy: "660f8400-e29b-41d4-a716-446655440001",
  effectiveDate: new Date("2024-01-01T00:00:00Z"),
  expirationDate: new Date("2024-12-31T23:59:59Z"), // Optional
  reason: "Promoted due to excellent community contributions"
}); // ✓ Valid

// Account status management
const statusSchema = pz.UserAccountStatus();
const statusUpdate = statusSchema.parse({
  userId: "550e8400-e29b-41d4-a716-446655440000",
  status: "active",
  previousStatus: "pending",
  changedBy: "system",
  reason: "Email verification completed",
  timestamp: new Date()
}); // ✓ Valid

// Account type validation
const accountTypeSchema = pz.UserAccountType();
const accountTypeData = accountTypeSchema.parse({
  accountType: "business",
  features: ["advanced_analytics", "team_collaboration", "priority_support"],
  billing: {
    plan: "professional",
    interval: "monthly",
    amount: 29.99
  },
  limits: {
    maxUsers: 10,
    maxProjects: 50,
    storageGB: 100
  }
}); // ✓ Valid
```

### Enhanced Registration with Uniqueness

```typescript
import { pz } from 'phantom-zod';

const existingEmails = ["john@example.com", "jane@example.com"];
const existingUsernames = ["john_doe", "jane_smith"];

const enhancedRegistrationSchema = UserRegistrationWithUniqueness(
  "Registration",
  MsgType.FieldName,
  existingEmails,
  existingUsernames
);

// Valid registration with unique credentials
const registration = enhancedRegistrationSchema.parse({
  username: "new_user",           // Unique username
  email: "new@example.com",       // Unique email
  password: "VerySecure123!",     // Strong password
  confirmPassword: "VerySecure123!",
  accountType: "individual",
  acceptTerms: true
}); // ✓ Valid

// Invalid - duplicate email
enhancedRegistrationSchema.parse({
  username: "another_user",
  email: "john@example.com",      // ✗ Error: Email already exists
  password: "VerySecure123!",
  confirmPassword: "VerySecure123!",
  accountType: "individual", 
  acceptTerms: true
});
```

## Error Messages

The user schemas provide specific error messages for different validation failures:

- **Password validation**: "Password is too short", "Password missing uppercase letters"
- **Username validation**: "Username contains invalid characters", "Username cannot start with underscore"
- **Registration validation**: "Passwords do not match", "Terms must be accepted"
- **Uniqueness validation**: "Email already exists", "Username already exists"
- **Role validation**: "Invalid role specified"
- **Account validation**: "Invalid account type specified"

## TypeScript Types

```typescript
// User role types
type UserRole = "admin" | "moderator" | "user" | "guest" | "subscriber" | "editor" | "author" | "contributor";

// User status types
type UserStatus = "active" | "inactive" | "pending" | "suspended" | "banned" | "deleted";

// Account type
type AccountType = "individual" | "business" | "organization" | "admin";

// User object types
type UserRequired = {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
  accountType?: AccountType;
  avatar?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  emailVerified?: boolean;
  phoneVerified?: boolean;
};

type UserOptional = UserRequired | undefined;

// Authentication types
type UserRegistration = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
};

type UserLogin = {
  identifier: string;
  password: string;
  rememberMe?: boolean;
};

// Usage with schemas
const schema = UserRequired();
type InferredType = z.infer<typeof schema>; // UserRequired
```

## Best Practices

### User Registration Flow

```typescript
import { pz } from 'phantom-zod';

// Step 1: Basic registration validation
const registrationStep1Schema = z.object({
  email: z.string().email(),
  agreeToNewsletter: z.boolean().optional()
});

// Step 2: Enhanced registration with uniqueness
const registrationStep2Schema = (existingEmails: string[], existingUsernames: string[]) =>
  UserRegistrationWithUniqueness(
    "Registration",
    MsgType.FieldName,
    existingEmails,
    existingUsernames
  );

// Step 3: Email verification
const emailVerificationSchema = z.object({
  userId: z.string(),
  verificationCode: z.string().length(6),
  email: z.string().email()
});
```

### Authentication Systems

```typescript
import { pz } from 'phantom-zod';

// Multi-factor authentication
const mfaLoginSchema = pz.UserLogin().extend({
  mfaCode: z.string().length(6).optional(),
  trustDevice: z.boolean().optional()
});

// Social auth integration
const socialAuthSchema = z.object({
  provider: z.enum(['google', 'facebook', 'github', 'twitter']),
  accessToken: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().url().optional()
});

// Session management
const sessionSchema = z.object({
  userId: z.string(),
  sessionToken: z.string(),
  expiresAt: z.date(),
  lastActivity: z.date(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional()
});
```

### Role-Based Access Control

```typescript
import { pz } from 'phantom-zod';

// Permission system
const permissionSchema = z.object({
  resource: z.string(),
  action: z.enum(['create', 'read', 'update', 'delete']),
  conditions: z.record(z.any()).optional()
});

// Role hierarchy validation
const roleHierarchySchema = z.object({
  role: RoleValidation(),
  permissions: z.array(permissionSchema),
  inheritsFrom: z.array(RoleValidation()).optional()
});

// Access control check
const accessControlSchema = z.object({
  userId: z.string(),
  requiredRole: RoleValidation(),
  requiredPermissions: z.array(permissionSchema).optional(),
  context: z.record(z.any()).optional()
});
```

### User Profile Management

```typescript
import { pz } from 'phantom-zod';

// Profile settings
const profileSettingsSchema = UserUpdate().extend({
  preferences: z.object({
    language: z.string(),
    timezone: z.string(),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean()
    }),
    privacy: z.object({
      profileVisibility: z.enum(['public', 'friends', 'private']),
      showEmail: z.boolean(),
      showLastSeen: z.boolean()
    })
  }).optional()
});

// Avatar upload
const avatarUploadSchema = z.object({
  userId: z.string(),
  avatar: z.string().url(),
  thumbnails: z.object({
    small: z.string().url(),
    medium: z.string().url(),
    large: z.string().url()
  })
});
```

## Integration Examples

### React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pz } from 'phantom-zod';

// Registration form
const registrationSchema = pz.UserRegistration();

function RegistrationForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registrationSchema)
  });

  const password = watch('password');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} placeholder="Username" />
      <input {...register('email')} type="email" placeholder="Email" />
      <input {...register('password')} type="password" placeholder="Password" />
      <input {...register('confirmPassword')} type="password" placeholder="Confirm Password" />
      <input {...register('displayName')} placeholder="Display Name (Optional)" />
      <input {...register('firstName')} placeholder="First Name (Optional)" />
      <input {...register('lastName')} placeholder="Last Name (Optional)" />
      
      <label>
        <input type="checkbox" {...register('acceptTerms')} />
        I accept the Terms of Service
      </label>

      {errors.username && <span>{errors.username.message}</span>}
      {errors.email && <span>{errors.email.message}</span>}
      {errors.password && <span>{errors.password.message}</span>}
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      {errors.acceptTerms && <span>{errors.acceptTerms.message}</span>}

      <button type="submit">Register</button>
    </form>
  );
}

// Login form
const loginSchema = pz.UserLogin();

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('identifier')} placeholder="Username or Email" />
      <input {...register('password')} type="password" placeholder="Password" />
      
      <label>
        <input type="checkbox" {...register('rememberMe')} />
        Remember me
      </label>

      {errors.identifier && <span>{errors.identifier.message}</span>}
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

### Express.js API

```typescript
import express from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { pz } from 'phantom-zod';

const app = express();

// User registration endpoint
const registrationSchema = pz.UserRegistration();

app.post('/api/auth/register', async (req, res) => {
  try {
    const userData = registrationSchema.parse(req.body);
    
    // Check for existing user
    const existingUser = await User.findOne({ 
      $or: [{ email: userData.email }, { username: userData.username }]
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user
    const user = await User.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      displayName: userData.displayName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'user',
      status: 'pending'
    });
    
    res.status(201).json({ success: true, userId: user._id });
  } catch (error) {
    res.status(400).json({ 
      error: 'Registration failed',
      details: error.errors 
    });
  }
});

// User login endpoint
const loginSchema = pz.UserLogin();

app.post('/api/auth/login', async (req, res) => {
  try {
    const credentials = loginSchema.parse(req.body);
    
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: credentials.identifier }, { username: credentials.identifier }]
    });
    
    if (!user || !await bcrypt.compare(credentials.password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account not active' });
    }
    
    // Update last login
    await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (error) {
    res.status(400).json({ 
      error: 'Login failed',
      details: error.errors 
    });
  }
});

// Password change endpoint
const passwordChangeSchema = PasswordChange();

app.put('/api/user/change-password', authenticateUser, async (req, res) => {
  try {
    const passwordData = passwordChangeSchema.parse(req.body);
    const user = await User.findById(req.user.id);
    
    // Verify current password
    if (!await bcrypt.compare(passwordData.currentPassword, user.password)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(passwordData.newPassword, 10);
    
    // Update password
    await User.updateOne(
      { _id: req.user.id },
      { password: hashedPassword, updatedAt: new Date() }
    );
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ 
      error: 'Password change failed',
      details: error.errors 
    });
  }
});

// Admin user management endpoint
const adminSchema = AdminUserManagement();

app.put('/api/admin/users/:userId', authenticateAdmin, async (req, res) => {
  try {
    const updateData = adminSchema.parse(req.body);
    
    const user = await User.findById(updateData.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user
    const updates: any = { updatedAt: new Date() };
    if (updateData.role) updates.role = updateData.role;
    if (updateData.status) updates.status = updateData.status;
    
    await User.updateOne({ _id: updateData.userId }, updates);
    
    // Log admin action
    await AdminLog.create({
      adminId: req.user.id,
      action: 'user_update',
      targetUserId: updateData.userId,
      changes: updates,
      reason: updateData.reason
    });
    
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    res.status(400).json({ 
      error: 'User update failed',
      details: error.errors 
    });
  }
});
```

### Database Models

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// User database model
export const UserModel = UserRequired().extend({
  password: z.string(), // Hashed password
  emailVerificationToken: z.string().optional(),
  emailVerifiedAt: z.date().optional(),
  passwordResetToken: z.string().optional(),
  passwordResetExpiresAt: z.date().optional(),
  twoFactorSecret: z.string().optional(),
  twoFactorEnabled: z.boolean().default(false),
  loginAttempts: z.number().default(0),
  lockedUntil: z.date().optional(),
  preferences: z.object({
    language: z.string().default('en'),
    timezone: z.string().default('UTC'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      marketing: z.boolean().default(false)
    })
  }).optional()
});

// User session model
export const UserSessionModel = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  lastActivity: z.date(),
  expiresAt: z.date(),
  createdAt: z.date(),
  revokedAt: z.date().optional()
});

// User activity log model
export const UserActivityModel = z.object({
  id: z.string(),
  userId: z.string(),
  action: z.enum(['login', 'logout', 'register', 'password_change', 'profile_update']),
  metadata: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.date()
});
```

### Authentication Service

```typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pz } from 'phantom-zod';

class AuthService {
  // Register new user
  async registerUser(data: unknown) {
    const registrationSchema = pz.UserRegistration();
    const validData = registrationSchema.parse(data);
    
    // Check for existing user
    const existingUser = await this.checkExistingUser(validData.email, validData.username);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validData.password, 10);
    
    // Create user
    const user = await this.createUser({
      ...validData,
      password: hashedPassword,
      role: 'user' as const,
      status: 'pending' as const,
      emailVerified: false,
      createdAt: new Date()
    });
    
    // Send verification email
    await this.sendVerificationEmail(user);
    
    return { userId: user.id, message: 'Registration successful' };
  }
  
  // Authenticate user login
  async loginUser(credentials: unknown) {
    const loginSchema = pz.UserLogin();
    const validCredentials = loginSchema.parse(credentials);
    
    // Find user
    const user = await this.findUserByIdentifier(validCredentials.identifier);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check password
    const passwordValid = await bcrypt.compare(validCredentials.password, user.password);
    if (!passwordValid) {
      await this.handleFailedLogin(user.id);
      throw new Error('Invalid credentials');
    }
    
    // Check account status
    if (user.status !== 'active') {
      throw new Error('Account not active');
    }
    
    // Update last login
    await this.updateLastLogin(user.id);
    
    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }
  
  // Change user password
  async changePassword(userId: string, data: unknown) {
    const passwordChangeSchema = PasswordChange();
    const validData = passwordChangeSchema.parse(data);
    
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const currentPasswordValid = await bcrypt.compare(
      validData.currentPassword, 
      user.password
    );
    if (!currentPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(validData.newPassword, 10);
    
    // Update password
    await this.updateUserPassword(userId, hashedPassword);
    
    // Revoke all existing sessions
    await this.revokeAllUserSessions(userId);
    
    return { message: 'Password changed successfully' };
  }
  
  private async checkExistingUser(email: string, username: string) {
    // Implementation would check database
    return null;
  }
  
  private async createUser(userData: any) {
    // Implementation would create user in database
    return { id: 'user123', ...userData };
  }
  
  private async findUserByIdentifier(identifier: string) {
    // Implementation would find user by email or username
    return null;
  }
  
  private async updateLastLogin(userId: string) {
    // Implementation would update last login timestamp
  }
  
  private generateAccessToken(user: any) {
    return jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
  }
  
  private generateRefreshToken(user: any) {
    return jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
  }
  
  private sanitizeUser(user: any) {
    // Remove sensitive fields
    const { password, emailVerificationToken, passwordResetToken, ...sanitized } = user;
    return sanitized;
  }
  
  private async sendVerificationEmail(user: any) {
    // Implementation would send verification email
  }
  
  private async handleFailedLogin(userId: string) {
    // Implementation would handle failed login attempts
  }
  
  private async findUserById(userId: string) {
    // Implementation would find user by ID
    return null;
  }
  
  private async updateUserPassword(userId: string, hashedPassword: string) {
    // Implementation would update password in database
  }
  
  private async revokeAllUserSessions(userId: string) {
    // Implementation would revoke all user sessions
  }
}

const authService = new AuthService();
export { authService };
```

### User Management Service

```typescript
import { pz } from 'phantom-zod';

class UserManagementService {
  // Admin user management
  async manageUser(adminId: string, data: unknown) {
    const managementSchema = AdminUserManagement();
    const validData = managementSchema.parse(data);
    
    const user = await this.findUserById(validData.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const updates: any = {};
    if (validData.role) updates.role = validData.role;
    if (validData.status) updates.status = validData.status;
    updates.updatedAt = new Date();
    
    await this.updateUser(validData.userId, updates);
    
    // Log admin action
    await this.logAdminAction({
      adminId,
      action: 'user_management',
      targetUserId: validData.userId,
      changes: updates,
      reason: validData.reason
    });
    
    return { message: 'User updated successfully' };
  }
  
  // Update user profile
  async updateUserProfile(userId: string, data: unknown) {
    const updateSchema = UserUpdate();
    const validData = updateSchema.parse(data);
    
    const updates = {
      ...validData,
      updatedAt: new Date()
    };
    
    await this.updateUser(userId, updates);
    
    return { message: 'Profile updated successfully' };
  }
  
  // Validate user role
  validateRole(role: string) {
    const roleSchema = RoleValidation();
    return roleSchema.safeParse(role);
  }
  
  // Get user statistics
  async getUserStatistics(userId: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const stats = await this.calculateUserStats(userId);
    
    return {
      user: this.sanitizeUser(user),
      statistics: stats
    };
  }
  
  private async findUserById(userId: string) {
    // Implementation would find user by ID
    return null;
  }
  
  private async updateUser(userId: string, updates: any) {
    // Implementation would update user in database
  }
  
  private async logAdminAction(action: any) {
    // Implementation would log admin action
  }
  
  private async calculateUserStats(userId: string) {
    // Implementation would calculate user statistics
    return {
      totalLogins: 0,
      lastLogin: new Date(),
      accountAge: 0,
      activityScore: 0
    };
  }
  
  private sanitizeUser(user: any) {
    // Remove sensitive fields
    const { password, ...sanitized } = user;
    return sanitized;
  }
}

const userManagementService = new UserManagementService();
export { userManagementService };
```

## Advanced Use Cases

### Multi-Tenant User System

```typescript
import { pz } from 'phantom-zod';

// Tenant-aware user schema
const tenantUserSchema = UserRequired().extend({
  tenantId: z.string(),
  tenantRole: z.enum([...USER_ROLES]),
  tenantPermissions: z.array(z.string()),
  tenantStatus: z.enum(['active', 'suspended', 'invited']),
  invitedBy: z.string().optional(),
  invitedAt: z.date().optional()
});

// Organization membership
const organizationMembershipSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  role: z.enum(['owner', 'admin', 'member', 'guest']),
  permissions: z.array(z.string()),
  joinedAt: z.date(),
  status: z.enum(['active', 'inactive', 'pending'])
});
```

### OAuth Integration

```typescript
import { pz } from 'phantom-zod';

// OAuth user creation
const oauthUserSchema = pz.UserRegistration().omit({
  password: true,
  confirmPassword: true,
  acceptTerms: true
}).extend({
  provider: z.enum(['google', 'facebook', 'github', 'twitter']),
  providerId: z.string(),
  providerData: z.record(z.any()),
  emailVerified: z.boolean().default(true) // OAuth users are pre-verified
});

// OAuth account linking
const oauthLinkingSchema = z.object({
  userId: z.string(),
  provider: z.enum(['google', 'facebook', 'github', 'twitter']),
  providerId: z.string(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional()
});
```

### User Analytics and Segmentation

```typescript
import { pz } from 'phantom-zod';

// User analytics schema
const userAnalyticsSchema = z.object({
  userId: z.string(),
  segmentId: z.string(),
  traits: z.record(z.any()),
  events: z.array(z.object({
    name: z.string(),
    properties: z.record(z.any()),
    timestamp: z.date()
  })),
  cohort: z.string().optional(),
  ltv: z.number().optional(),
  churnRisk: z.number().min(0).max(1).optional()
});

// User segmentation
const userSegmentSchema = z.object({
  name: z.string(),
  description: z.string(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
    value: z.any()
  })),
  userCount: z.number(),
  isActive: z.boolean()
});
```

## See Also

- [String Schemas](./string-schemas.md) - For username and name validation
- [Email Schemas](./email-schemas.md) - For email validation
- [Enum Schemas](./enum-schemas.md) - For role and status validation
- [Boolean Schemas](./boolean-schemas.md) - For terms acceptance and feature flags
- [Date Schemas](./date-schemas.md) - For timestamp validation
- [Authentication Guide](../guides/authentication.md) - Authentication implementation patterns
