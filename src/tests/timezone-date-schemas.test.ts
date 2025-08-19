import { z } from "zod";
import {
  zTimezoneDateTimeOptional,
  zTimezoneDateTimeRequired,
  TimezoneDateTimeOptional,
  TimezoneDateTimeRequired,
} from "../schemas/date-schemas";

describe("Timezone DateTime Schemas", () => {
  describe("zTimezoneDateTimeOptional", () => {
    const schema = zTimezoneDateTimeOptional();

    it("should accept valid ISO 8601 datetime strings with Z timezone", () => {
      const validDates = [
        "2023-01-01T00:00:00Z",
        "2024-12-31T23:59:59Z",
        "2023-06-15T12:30:45Z",
      ];

      validDates.forEach((date) => {
        expect(() => schema.parse(date)).not.toThrow();
        expect(schema.parse(date)).toBe(date);
      });
    });

    it("should accept valid ISO 8601 datetime strings with offset timezone", () => {
      const validDates = [
        "2023-01-01T00:00:00+00:00",
        "2023-01-01T00:00:00-05:00",
        "2023-01-01T00:00:00+09:30",
        "2024-12-31T23:59:59-11:00",
        "2023-06-15T12:30:45+02:00",
      ];

      validDates.forEach((date) => {
        expect(() => schema.parse(date)).not.toThrow();
        expect(schema.parse(date)).toBe(date);
      });
    });

    it("should accept undefined", () => {
      expect(() => schema.parse(undefined)).not.toThrow();
      expect(schema.parse(undefined)).toBeUndefined();
    });

    it("should reject naive datetime strings (without timezone)", () => {
      const naiveDates = [
        "2023-01-01T00:00:00",
        "2024-12-31T23:59:59",
        "2023-06-15T12:30:45",
        "2023-01-01 00:00:00", // with space instead of T
      ];

      naiveDates.forEach((date) => {
        expect(() => schema.parse(date)).toThrow();
      });
    });

    it("should reject Date objects", () => {
      const dateObj = new Date("2023-01-01T00:00:00Z");
      expect(() => schema.parse(dateObj)).toThrow();
    });

    it("should reject invalid date strings", () => {
      const invalidDates = [
        "not-a-date",
        "2023-13-01T00:00:00Z", // invalid month
        "2023-01-32T00:00:00Z", // invalid day
        "2023-01-01T25:00:00Z", // invalid hour
        "2023-01-01T00:60:00Z", // invalid minute
        "2023-01-01T00:00:60Z", // invalid second
        "", // empty string
        "2023-01-01", // date only
        "T00:00:00Z", // time only
      ];

      invalidDates.forEach((date) => {
        expect(() => schema.parse(date)).toThrow();
      });
    });

    it("should reject non-string values", () => {
      const nonStrings = [123, true, null, {}, []];

      nonStrings.forEach((value) => {
        expect(() => schema.parse(value)).toThrow();
      });
    });

    it("should provide appropriate error message for timezone requirement", () => {
      try {
        schema.parse("2023-01-01T00:00:00");
        fail("Should have thrown an error");
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Our custom message handler provides the timezone error message
          expect(error.issues[0].message).toContain(
            "must include timezone information",
          );
        } else {
          fail("Should be a ZodError");
        }
      }
    });
  });

  describe("zTimezoneDateTimeRequired", () => {
    const schema = zTimezoneDateTimeRequired();

    it("should accept valid ISO 8601 datetime strings with Z timezone", () => {
      const validDates = [
        "2023-01-01T00:00:00Z",
        "2024-12-31T23:59:59Z",
        "2023-06-15T12:30:45Z",
      ];

      validDates.forEach((date) => {
        expect(() => schema.parse(date)).not.toThrow();
        expect(schema.parse(date)).toBe(date);
      });
    });

    it("should accept valid ISO 8601 datetime strings with offset timezone", () => {
      const validDates = [
        "2023-01-01T00:00:00+00:00",
        "2023-01-01T00:00:00-05:00",
        "2023-01-01T00:00:00+09:30",
        "2024-12-31T23:59:59-11:00",
        "2023-06-15T12:30:45+02:00",
      ];

      validDates.forEach((date) => {
        expect(() => schema.parse(date)).not.toThrow();
        expect(schema.parse(date)).toBe(date);
      });
    });

    it("should reject undefined", () => {
      expect(() => schema.parse(undefined)).toThrow();
    });

    it("should reject null", () => {
      expect(() => schema.parse(null)).toThrow();
    });

    it("should reject naive datetime strings (without timezone)", () => {
      const naiveDates = [
        "2023-01-01T00:00:00",
        "2024-12-31T23:59:59",
        "2023-06-15T12:30:45",
        "2023-01-01 00:00:00", // with space instead of T
      ];

      naiveDates.forEach((date) => {
        expect(() => schema.parse(date)).toThrow();
      });
    });

    it("should reject Date objects", () => {
      const dateObj = new Date("2023-01-01T00:00:00Z");
      expect(() => schema.parse(dateObj)).toThrow();
    });

    it("should reject invalid date strings", () => {
      const invalidDates = [
        "not-a-date",
        "2023-13-01T00:00:00Z", // invalid month
        "2023-01-32T00:00:00Z", // invalid day
        "2023-01-01T25:00:00Z", // invalid hour
        "2023-01-01T00:60:00Z", // invalid minute
        "2023-01-01T00:00:60Z", // invalid second
        "", // empty string
        "2023-01-01", // date only
        "T00:00:00Z", // time only
      ];

      invalidDates.forEach((date) => {
        expect(() => schema.parse(date)).toThrow();
      });
    });

    it("should reject non-string values", () => {
      const nonStrings = [123, true, {}, []];

      nonStrings.forEach((value) => {
        expect(() => schema.parse(value)).toThrow();
      });
    });

    it("should provide appropriate error message for timezone requirement", () => {
      try {
        schema.parse("2023-01-01T00:00:00");
        fail("Should have thrown an error");
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Our custom message handler provides the timezone error message
          expect(error.issues[0].message).toContain(
            "must include timezone information",
          );
        } else {
          fail("Should be a ZodError");
        }
      }
    });
  });

  describe("String parameter overloads", () => {
    describe("TimezoneDateTimeOptional", () => {
      it("should work with default parameters", () => {
        const schema = TimezoneDateTimeOptional();
        expect(() => schema.parse("2023-01-01T00:00:00Z")).not.toThrow();
        expect(() => schema.parse(undefined)).not.toThrow();
        expect(() => schema.parse("2023-01-01T00:00:00")).toThrow();
      });

      it("should work with custom error message", () => {
        const customMessage = "Custom timezone error";
        const schema = TimezoneDateTimeOptional(customMessage);

        try {
          schema.parse("2023-01-01T00:00:00");
          fail("Should have thrown an error");
        } catch (error) {
          if (error instanceof z.ZodError) {
            // The custom message gets formatted with the message handler
            expect(error.issues[0].message).toContain(customMessage);
          } else {
            fail("Should be a ZodError");
          }
        }
      });
    });

    describe("TimezoneDateTimeRequired", () => {
      it("should work with default parameters", () => {
        const schema = TimezoneDateTimeRequired();
        expect(() => schema.parse("2023-01-01T00:00:00Z")).not.toThrow();
        expect(() => schema.parse(undefined)).toThrow();
        expect(() => schema.parse("2023-01-01T00:00:00")).toThrow();
      });

      it("should work with custom error message", () => {
        const customMessage = "Custom timezone error";
        const schema = TimezoneDateTimeRequired(customMessage);

        try {
          schema.parse("2023-01-01T00:00:00");
          fail("Should have thrown an error");
        } catch (error) {
          if (error instanceof z.ZodError) {
            // The custom message gets formatted with the message handler
            expect(error.issues[0].message).toContain(customMessage);
          } else {
            fail("Should be a ZodError");
          }
        }
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle milliseconds in timezone datetime strings", () => {
      const schema = zTimezoneDateTimeRequired();
      const validDatesWithMs = [
        "2023-01-01T00:00:00.000Z",
        "2023-01-01T00:00:00.123Z",
        "2023-01-01T00:00:00.123456Z",
        "2023-01-01T00:00:00.999+02:00",
      ];

      validDatesWithMs.forEach((date) => {
        expect(() => schema.parse(date)).not.toThrow();
        expect(schema.parse(date)).toBe(date);
      });
    });

    it("should handle edge timezone offsets", () => {
      const schema = zTimezoneDateTimeRequired();
      const edgeTimezones = [
        "2023-01-01T00:00:00+14:00", // maximum positive offset
        "2023-01-01T00:00:00-12:00", // maximum negative offset
        "2023-01-01T00:00:00+00:00", // UTC equivalent to Z
      ];

      edgeTimezones.forEach((date) => {
        expect(() => schema.parse(date)).not.toThrow();
        expect(schema.parse(date)).toBe(date);
      });
    });

    it("should reject invalid timezone offsets", () => {
      const schema = zTimezoneDateTimeRequired();
      const invalidTimezones = [
        "2023-01-01T00:00:00+25:00", // invalid hour
        "2023-01-01T00:00:00+05:60", // invalid minute
      ];

      invalidTimezones.forEach((date) => {
        expect(() => schema.parse(date)).toThrow();
      });
    });

    it("should accept timezone offsets beyond typical UTC range", () => {
      // Zod allows these even though they're beyond typical UTC range
      const schema = zTimezoneDateTimeRequired();
      const edgeTimezones = [
        "2023-01-01T00:00:00+15:00", // beyond typical range but valid format
        "2023-01-01T00:00:00-13:00", // beyond typical range but valid format
      ];

      edgeTimezones.forEach((date) => {
        expect(() => schema.parse(date)).not.toThrow();
        expect(schema.parse(date)).toBe(date);
      });
    });
  });
});
