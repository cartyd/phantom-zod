import { z } from "zod";
import { pz } from "../src/pz";
import { MsgType } from "../src/common/types/msg-type";

describe("Record Schemas", () => {
  describe("RecordOptional", () => {
    describe("Basic functionality", () => {
      it("should accept valid record with string values", () => {
        const schema = pz.RecordOptional(z.string(), "Settings");
        const result = schema.parse({ theme: "dark", lang: "en" });
        expect(result).toEqual({ theme: "dark", lang: "en" });
      });

      it("should accept valid record with number values", () => {
        const schema = pz.RecordOptional(z.number(), "Counters");
        const result = schema.parse({ views: 100, clicks: 25 });
        expect(result).toEqual({ views: 100, clicks: 25 });
      });

      it("should accept valid record with complex object values", () => {
        const valueSchema = z.object({
          professor: z.string(),
          cfu: z.number(),
        });
        const schema = pz.RecordOptional(valueSchema, "Courses");
        const result = schema.parse({
          "Computer Science": { professor: "Mary Jane", cfu: 12 },
          "Mathematics": { professor: "John Doe", cfu: 12 },
        });
        expect(result).toEqual({
          "Computer Science": { professor: "Mary Jane", cfu: 12 },
          "Mathematics": { professor: "John Doe", cfu: 12 },
        });
      });

      it("should accept undefined", () => {
        const schema = pz.RecordOptional(z.string(), "Settings");
        const result = schema.parse(undefined);
        expect(result).toBeUndefined();
      });

      it("should accept empty record", () => {
        const schema = pz.RecordOptional(z.string(), "Settings");
        const result = schema.parse({});
        expect(result).toEqual({});
      });
    });

    describe("Invalid input validation", () => {
      it("should reject non-object input", () => {
        const schema = pz.RecordOptional(z.string(), "Settings");
        expect(() => schema.parse("not-an-object")).toThrow();
        expect(() => schema.parse(123)).toThrow();
        expect(() => schema.parse(true)).toThrow();
      });

      it("should reject array input", () => {
        const schema = pz.RecordOptional(z.string(), "Settings");
        expect(() => schema.parse(["not", "a", "record"])).toThrow();
      });

      it("should reject null input", () => {
        const schema = pz.RecordOptional(z.string(), "Settings");
        expect(() => schema.parse(null)).toThrow();
      });

      it("should reject record with invalid values", () => {
        const schema = pz.RecordOptional(z.string(), "Settings");
        expect(() => schema.parse({ theme: "dark", count: 123 })).toThrow();
      });
    });

    describe("Constraint validation", () => {
      it("should enforce minEntries constraint", () => {
        const schema = pz.RecordOptional(z.string(), {
          msg: "Settings",
          minEntries: 2,
        });
        expect(() => schema.parse({ theme: "dark" })).toThrow(/at least 2 entries/);
        expect(() => schema.parse({})).toThrow(/at least 2 entries/);
        
        const result = schema.parse({ theme: "dark", lang: "en" });
        expect(result).toEqual({ theme: "dark", lang: "en" });
      });

      it("should enforce maxEntries constraint", () => {
        const schema = pz.RecordOptional(z.string(), {
          msg: "Settings",
          maxEntries: 2,
        });
        expect(() => schema.parse({ 
          theme: "dark", 
          lang: "en", 
          region: "us" 
        })).toThrow(/at most 2 entries/);
        
        const result = schema.parse({ theme: "dark", lang: "en" });
        expect(result).toEqual({ theme: "dark", lang: "en" });
      });

      it("should enforce allowedKeys constraint", () => {
        const schema = pz.RecordOptional(z.string(), {
          msg: "Settings",
          allowedKeys: ["theme", "lang", "timezone"],
        });
        expect(() => schema.parse({ 
          theme: "dark", 
          invalidKey: "value" 
        })).toThrow(/invalid keys/);
        
        const result = schema.parse({ theme: "dark", lang: "en" });
        expect(result).toEqual({ theme: "dark", lang: "en" });
      });

      it("should enforce requiredKeys constraint", () => {
        const schema = pz.RecordOptional(z.string(), {
          msg: "Settings",
          requiredKeys: ["theme", "lang"],
        });
        expect(() => schema.parse({ theme: "dark" })).toThrow(/missing required keys/);
        
        const result = schema.parse({ theme: "dark", lang: "en" });
        expect(result).toEqual({ theme: "dark", lang: "en" });
      });

      it("should enforce keyPattern constraint", () => {
        const schema = pz.RecordOptional(z.string(), {
          msg: "Settings",
          keyPattern: /^[a-z][a-zA-Z0-9]*$/,
        });
        expect(() => schema.parse({ 
          validKey: "value",
          "invalid-key": "value"
        })).toThrow(/contains keys that don't match the required pattern/);
        
        const result = schema.parse({ validKey: "value", anotherValidKey: "value" });
        expect(result).toEqual({ validKey: "value", anotherValidKey: "value" });
      });

      it("should prioritize allowedKeys over keyPattern", () => {
        const schema = pz.RecordOptional(z.string(), {
          msg: "Settings",
          allowedKeys: ["valid-key"], // This should take precedence
          keyPattern: /^[a-z]+$/, // This should be ignored
        });
        
        const result = schema.parse({ "valid-key": "value" });
        expect(result).toEqual({ "valid-key": "value" });
      });
    });

    describe("String parameter overloads", () => {
      it("should work with string parameter (simple syntax)", () => {
        const schema = pz.RecordOptional(z.string(), "User Settings");
        const result = schema.parse({ theme: "dark" });
        expect(result).toEqual({ theme: "dark" });
      });

      it("should work with options object (traditional syntax)", () => {
        const schema = pz.RecordOptional(z.string(), { msg: "User Settings" });
        const result = schema.parse({ theme: "dark" });
        expect(result).toEqual({ theme: "dark" });
      });

      it("should work with no second parameter", () => {
        const schema = pz.RecordOptional(z.string());
        const result = schema.parse({ theme: "dark" });
        expect(result).toEqual({ theme: "dark" });
      });
    });

    describe("Error messages", () => {
      it("should use custom field name in error messages", () => {
        const schema = pz.RecordOptional(z.string(), "User Preferences");
        expect(() => schema.parse(123)).toThrow(/User Preferences/);
      });

      it("should use custom message when msgType is Message", () => {
        const schema = pz.RecordOptional(z.string(), {
          msg: "Please provide valid user preferences",
          msgType: MsgType.Message,
        });
        expect(() => schema.parse(123)).toThrow(/Please provide valid user preferences/);
      });
    });
  });

  describe("RecordRequired", () => {
    describe("Basic functionality", () => {
      it("should accept valid record with string values", () => {
        const schema = pz.RecordRequired(z.string(), "Configuration");
        const result = schema.parse({ host: "localhost", port: "3000" });
        expect(result).toEqual({ host: "localhost", port: "3000" });
      });

      it("should accept valid record with number values", () => {
        const schema = pz.RecordRequired(z.number(), "Metrics");
        const result = schema.parse({ views: 100, clicks: 25 });
        expect(result).toEqual({ views: 100, clicks: 25 });
      });

      it("should accept valid record with boolean values", () => {
        const schema = pz.RecordRequired(z.boolean(), "Feature Flags");
        const result = schema.parse({ darkMode: true, notifications: false });
        expect(result).toEqual({ darkMode: true, notifications: false });
      });

      it("should reject undefined", () => {
        const schema = pz.RecordRequired(z.string(), "Configuration");
        expect(() => schema.parse(undefined)).toThrow(/must be a valid record/);
      });

      it("should reject null", () => {
        const schema = pz.RecordRequired(z.string(), "Configuration");
        expect(() => schema.parse(null)).toThrow(/must be a valid record/);
      });

      it("should require at least 1 entry by default", () => {
        const schema = pz.RecordRequired(z.string(), "Configuration");
        expect(() => schema.parse({})).toThrow(/at least 1/);
      });

      it("should allow empty record when minEntries is 0", () => {
        const schema = pz.RecordRequired(z.string(), {
          msg: "Configuration",
          minEntries: 0,
        });
        const result = schema.parse({});
        expect(result).toEqual({});
      });
    });

    describe("Real-world use cases", () => {
      it("should validate course records with specific allowed keys", () => {
        const courseInfoSchema = z.object({
          professor: z.string(),
          cfu: z.number(),
        });

        const schema = pz.RecordRequired(courseInfoSchema, {
          msg: "Courses",
          allowedKeys: ["Computer Science", "Mathematics", "Literature"],
          requiredKeys: ["Computer Science", "Mathematics"],
        });

        const validCourses = {
          "Computer Science": { professor: "Mary Jane", cfu: 12 },
          "Mathematics": { professor: "John Doe", cfu: 12 },
          "Literature": { professor: "Frank Purple", cfu: 12 },
        };

        const result = schema.parse(validCourses);
        expect(result).toEqual(validCourses);

        // Should reject missing required key
        expect(() => schema.parse({
          "Computer Science": { professor: "Mary Jane", cfu: 12 },
        })).toThrow(/missing required keys/);

        // Should reject invalid key
        expect(() => schema.parse({
          "Computer Science": { professor: "Mary Jane", cfu: 12 },
          "Mathematics": { professor: "John Doe", cfu: 12 },
          "Physics": { professor: "Albert Einstein", cfu: 15 },
        })).toThrow(/invalid keys/);
      });

      it("should validate server configuration", () => {
        const schema = pz.RecordRequired(z.string(), {
          msg: "Server Configuration",
          requiredKeys: ["host", "port"],
          allowedKeys: ["host", "port", "timeout", "retries"],
        });

        const validConfig = {
          host: "localhost",
          port: "3000",
          timeout: "30000",
        };

        const result = schema.parse(validConfig);
        expect(result).toEqual(validConfig);

        // Should reject missing required keys
        expect(() => schema.parse({ host: "localhost" })).toThrow(/missing required keys.*port/);
      });

      it("should validate metadata with pattern constraints", () => {
        const schema = pz.RecordRequired(z.string(), {
          msg: "Metadata",
          keyPattern: /^[a-z][a-zA-Z0-9_]*$/,
          maxEntries: 5,
        });

        const validMetadata = {
          author: "John Doe",
          version: "1.0.0",
          category: "utility",
        };

        const result = schema.parse(validMetadata);
        expect(result).toEqual(validMetadata);

        // Should reject invalid key pattern
        expect(() => schema.parse({
          author: "John Doe",
          "invalid-key": "value",
        })).toThrow(/contains keys that don't match the required pattern/);

        // Should reject too many entries
        expect(() => schema.parse({
          key1: "value1",
          key2: "value2",
          key3: "value3",
          key4: "value4",
          key5: "value5",
          key6: "value6",
        })).toThrow(/at most 5/);
      });
    });

    describe("String parameter overloads", () => {
      it("should work with string parameter (simple syntax)", () => {
        const schema = pz.RecordRequired(z.string(), "Application Config");
        const result = schema.parse({ host: "localhost" });
        expect(result).toEqual({ host: "localhost" });
      });

      it("should work with options object (traditional syntax)", () => {
        const schema = pz.RecordRequired(z.string(), { msg: "Application Config" });
        const result = schema.parse({ host: "localhost" });
        expect(result).toEqual({ host: "localhost" });
      });

      it("should work with no second parameter", () => {
        const schema = pz.RecordRequired(z.string());
        const result = schema.parse({ host: "localhost" });
        expect(result).toEqual({ host: "localhost" });
      });
    });

    describe("Error messages", () => {
      it("should use custom field name in error messages", () => {
        const schema = pz.RecordRequired(z.string(), "Server Configuration");
        expect(() => schema.parse(123)).toThrow(/Server Configuration/);
      });

      it("should use custom message when msgType is Message", () => {
        const schema = pz.RecordRequired(z.string(), {
          msg: "Please provide a valid configuration object",
          msgType: MsgType.Message,
        });
        expect(() => schema.parse(123)).toThrow(/Please provide a valid configuration object/);
      });

      it("should provide detailed constraint error messages", () => {
        const schema = pz.RecordRequired(z.string(), {
          msg: "Settings",
          minEntries: 2,
          maxEntries: 5,
          requiredKeys: ["host", "port"],
          allowedKeys: ["host", "port", "timeout"],
        });

        expect(() => schema.parse({})).toThrow(/at least 2 entries/);
        expect(() => schema.parse({ host: "localhost" })).toThrow(/missing required keys.*port/);
        expect(() => schema.parse({ 
          host: "localhost", 
          port: "3000",
          invalidKey: "value"
        })).toThrow(/invalid keys/);
      });
    });
  });

  describe("Integration with other pz schemas", () => {
    it("should work with pz.StringRequired for values", () => {
      const schema = pz.RecordRequired(pz.StringRequired("Field"), "Configuration");
      const result = schema.parse({ host: "localhost", port: "3000" });
      expect(result).toEqual({ host: "localhost", port: "3000" });

      expect(() => schema.parse({ host: "" })).toThrow(); // Empty string should fail StringRequired
    });

    it("should work with pz.EmailRequired for values", () => {
      const schema = pz.RecordOptional(pz.EmailRequired("Email"), "Email Mapping");
      const result = schema.parse({ 
        admin: "admin@example.com", 
        support: "support@example.com" 
      });
      expect(result).toEqual({ 
        admin: "admin@example.com", 
        support: "support@example.com" 
      });

      expect(() => schema.parse({ admin: "invalid-email" })).toThrow();
    });

    it("should work with complex nested schemas", () => {
      const userSchema = z.object({
        id: pz.UuidV4Required("User ID"),
        email: pz.EmailRequired("Email"),
        isActive: pz.BooleanRequired("Active Status"),
      });

      const schema = pz.RecordRequired(userSchema, "User Directory");
      const result = schema.parse({
        "user1": {
          id: "123e4567-e89b-42d3-a456-426614174000",
          email: "user1@example.com",
          isActive: true,
        },
        "user2": {
          id: "987fcdeb-51a2-4321-9876-543210987654",
          email: "user2@example.com",
          isActive: false,
        },
      });

      expect(result).toHaveProperty("user1");
      expect(result).toHaveProperty("user2");
      expect((result.user1 as any).email).toBe("user1@example.com");
    });
  });

  describe("Edge cases and performance", () => {
    it("should handle very large records efficiently", () => {
      const schema = pz.RecordOptional(z.string(), "Large Record");
      const largeRecord: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeRecord[`key${i}`] = `value${i}`;
      }

      const start = Date.now();
      const result = schema.parse(largeRecord);
      const duration = Date.now() - start;

      expect(result).toEqual(largeRecord);
      expect(duration).toBeLessThan(100); // Should be fast
    });

    it("should handle unicode keys correctly", () => {
      const schema = pz.RecordOptional(z.string(), "Unicode Record");
      const unicodeRecord = {
        "简体中文": "simplified chinese",
        "日本語": "japanese",
        "العربية": "arabic",
        "🔑": "key emoji",
      };

      const result = schema.parse(unicodeRecord);
      expect(result).toEqual(unicodeRecord);
    });

    it("should handle special characters in keys", () => {
      const schema = pz.RecordOptional(z.string(), {
        msg: "Special Keys",
        keyPattern: /^[a-zA-Z0-9._-]+$/, // Allow dots, underscores, hyphens
      });

      const result = schema.parse({
        "valid.key": "value1",
        "valid_key": "value2",
        "valid-key": "value3",
      });

      expect(result).toEqual({
        "valid.key": "value1",
        "valid_key": "value2",
        "valid-key": "value3",
      });
    });

    it("should handle empty string keys", () => {
      const schema = pz.RecordOptional(z.string(), "Empty Key Record");
      const result = schema.parse({ "": "empty key value" });
      expect(result).toEqual({ "": "empty key value" });
    });
  });

  describe("Type safety and inference", () => {
    it("should maintain proper TypeScript types", () => {
      const stringSchema = pz.RecordRequired(z.string(), "String Record");
      const numberSchema = pz.RecordOptional(z.number(), "Number Record");
      
      // These should compile without TypeScript errors
      const stringResult = stringSchema.parse({ key: "value" }) as Record<string, string>;
      const numberResult = numberSchema.parse({ count: 42 }) as Record<string, number> | undefined;
      
      expect(stringResult.key).toBe("value");
      expect(numberResult?.count).toBe(42);
    });

    it("should work with union types", () => {
      const unionSchema = pz.RecordRequired(
        z.union([z.string(), z.number(), z.boolean()]),
        "Mixed Record"
      );

      const result = unionSchema.parse({
        stringField: "text",
        numberField: 42,
        booleanField: true,
      });

      expect(result).toEqual({
        stringField: "text",
        numberField: 42,
        booleanField: true,
      });
    });
  });

  describe("Chainable .default() support", () => {
    it("should support .default() chaining", () => {
      const schema = pz.RecordOptional(z.string(), "Settings")
        .default({ theme: "light", lang: "en" });

      const result = schema.parse(undefined);
      expect(result).toEqual({ theme: "light", lang: "en" });
    });

    it("should support complex chaining with other Zod methods", () => {
      const schema = pz.RecordRequired(z.string(), "Config")
        .default({ host: "localhost" })
        .refine((config) => config.host !== "", {
          message: "Host cannot be empty",
        });

      const result = schema.parse(undefined);
      expect(result).toEqual({ host: "localhost" });

      expect(() => schema.parse({ host: "" })).toThrow(/Host cannot be empty/);
    });
  });
});
