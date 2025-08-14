import { z } from 'zod';
import { pz } from '../src';

describe('Person Schema', () => {
  const personSchema = z.object({
    id: pz.zUuidV7Required({ msg: 'id' }),
    name: pz.zStringRequired({ msg: 'name' }),
    age: pz.zNumberOptional({ msg: 'age' }),
    email: pz.zEmailRequired({ msg: 'email' }),
    nickname: pz.zStringOptional({ msg: 'nickname' }),
    phone: pz.zPhoneOptional({ msg: 'phone' }),
    isActive: pz.zBooleanRequired({ msg: 'isActive' }),
    roles: pz.zStringArrayOptional({ msg: 'roles' }),
    website: pz.zUrlOptional({ msg: 'website' }),
    createdAt: pz.zDateStringOptional({ msg: 'createdAt' }),
    user: pz.zUserOptional({ msg: 'user' }), // Nested user schema if available
  });

  const cases = [
    {
      name: 'valid person with all fields',
      input: {
        id: '018f6d6e-f14d-7c2a-b732-c6d5730303e0',
        name: 'Alice',
        age: 30,
        email: 'alice@example.com',
        nickname: 'Al',
        phone: '+1234567890',
        isActive: true,
        roles: ['admin', 'user'],
        website: 'https://alice.com',
        createdAt: '2025-08-14',
        user: {
          id: '018f6d6e-f14d-7c2a-b732-c6d5730303e1',
          username: 'aliceuser',
          email: 'aliceuser@example.com',
          displayName: 'Alice User',
          role: 'user',
          status: 'active',
          accountType: 'individual',
          avatar: 'https://example.com/avatar.png',
          bio: 'Test user bio',
          createdAt: new Date('2025-08-14T12:00:00Z'),
          updatedAt: new Date('2025-08-14T12:00:00Z'),
          lastLoginAt: new Date('2025-08-14T12:00:00Z'),
          emailVerified: true,
          phoneVerified: false,
        },
      },
      valid: true,
    },
    {
      name: 'valid person with only required fields',
      input: {
        id: '018f6d6e-f14d-7c2a-b732-c6d5730303e0',
        name: 'Bob',
        email: 'bob@example.com',
        isActive: false,
      },
      valid: true,
    },
    {
      name: 'invalid email',
      input: {
        id: '018f6d6e-f14d-7c2a-b732-c6d5730303e0',
        name: 'Carol',
        email: 'carol@c',
        isActive: true,
      },
      valid: false,
    },
    {
      name: 'missing name',
      input: {
        id: '018f6d6e-f14d-7c2a-b732-c6d5730303e0',
        email: 'dan@example.com',
        isActive: true,
      },
      valid: false,
    },
    {
      name: 'invalid id (not guidv7)',
      input: {
        id: 'not-a-guid',
        name: 'Eve',
        email: 'eve@example.com',
        isActive: true,
      },
      valid: false,
    },
    {
      name: 'edge: age is 0',
      input: {
        id: '018f6d6e-f14d-7c2a-b732-c6d5730303e0',
        name: 'Frank',
        age: 0,
        email: 'frank@example.com',
        isActive: true,
      },
      valid: true,
    },
    {
      name: 'edge: empty name',
      input: {
        id: '018f6d6e-f14d-7c2a-b732-c6d5730303e0',
        name: '',
        email: 'grace@example.com',
        isActive: true,
      },
      valid: false,
    },
    {
      name: 'invalid website url',
      input: {
        id: '018f6d6e-f14d-7c2a-b732-c6d5730303e0',
        name: 'Henry',
        email: 'henry@example.com',
        isActive: true,
        website: 'not-a-url',
      },
      valid: false,
    },
    {
      name: 'invalid nested user',
      input: {
        id: '018f6d6e-f14d-7c2a-b732-c6d5730303e0',
        name: 'Ivy',
        email: 'ivy@example.com',
        isActive: true,
        user: {
          id: 'not-a-guid',
          username: '',
          email: 'not-an-email',
        },
      },
      valid: false,
    },
  ];

  cases.forEach(({ name, input, valid }) => {
    it(name, () => {
      if (valid) {
        expect(() => personSchema.parse(input)).not.toThrow();
      } else {
        expect(() => personSchema.parse(input)).toThrow();
      }
    });
  });
});
