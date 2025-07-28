import { createIdListSchemas } from "../src/schemas/id-list-schemas";
import { MsgType } from "../src/common/types/msg-type";
import { createTestMessageHandler } from "../src/localization/types/message-handler.types";

describe("ID List Schemas", () => {
    const messageHandler = createTestMessageHandler();
    const {
        zIdListOptional,
        zIdListRequired,
        zId,
        zUniqueIdList,
        zPaginatedIdList,
        zBatchOperationResponse,
        zCustomId,
        zMongoId,
        zMongoIdList,
        zFlexibleId,
    } = createIdListSchemas(messageHandler);
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";
    const validUuid2 = "987fcdeb-51a2-4321-9876-543210987654";
    const invalidUuid = "invalid-uuid";
    const validMongoId = "507f1f77bcf86cd799439011";
    const validMongoId2 = "507f1f77bcf86cd799439012";
    const invalidMongoId = "invalid-mongo-id";

    describe("zIdListOptional", () => {
        const schema = zIdListOptional();

        it("should accept undefined", () => {
            expect(schema.parse(undefined)).toBe(undefined);
        });

        it("should accept valid UUID list", () => {
            const validList = [validUuid, validUuid2];
            expect(schema.parse(validList)).toEqual(validList);
        });

        it("should reject list with invalid UUIDs", () => {
            const invalidList = [validUuid, invalidUuid];
            expect(() => schema.parse(invalidList)).toThrow();
        });

        it("should validate minimum items", () => {
            const schema = zIdListOptional("IDs", MsgType.FieldName, 2);
            expect(() => schema.parse([validUuid])).toThrow();
            expect(schema.parse([validUuid, validUuid2])).toEqual([validUuid, validUuid2]);
        });

        it("should validate maximum items", () => {
            const schema = zIdListOptional("IDs", MsgType.FieldName, 1, 2);
            const tooManyIds = [validUuid, validUuid2, validUuid];
            expect(() => schema.parse(tooManyIds)).toThrow();
        });

        it("should accept empty array when min is 0", () => {
            const schema = zIdListOptional("IDs", MsgType.FieldName, 0);
            expect(schema.parse([])).toEqual([]);
        });
    });

    describe("zIdListRequired", () => {
        const schema = zIdListRequired();

        it("should accept valid UUID list", () => {
            const validList = [validUuid, validUuid2];
            expect(schema.parse(validList)).toEqual(validList);
        });

        it("should reject undefined", () => {
            expect(() => schema.parse(undefined)).toThrow();
        });

        it("should reject empty array by default", () => {
            expect(() => schema.parse([])).toThrow();
        });

        it("should reject list with invalid UUIDs", () => {
            const invalidList = [validUuid, invalidUuid];
            expect(() => schema.parse(invalidList)).toThrow();
        });

        it("should validate custom min/max constraints", () => {
            const schema = zIdListRequired("IDs", MsgType.FieldName, 2, 3);
            expect(() => schema.parse([validUuid])).toThrow();
            expect(schema.parse([validUuid, validUuid2])).toEqual([validUuid, validUuid2]);
            expect(() => schema.parse([validUuid, validUuid2, validUuid, validUuid2])).toThrow();
        });
    });

    describe("zId", () => {
        const schema = zId();

        it("should accept valid UUID", () => {
            expect(schema.parse(validUuid)).toBe(validUuid);
        });

        it("should reject invalid UUID", () => {
            expect(() => schema.parse(invalidUuid)).toThrow();
        });

        it("should reject non-string input", () => {
            expect(() => schema.parse(123)).toThrow();
            expect(() => schema.parse(null)).toThrow();
            expect(() => schema.parse(undefined)).toThrow();
        });
    });

    describe("zUniqueIdList", () => {
        const schema = zUniqueIdList();

        it("should accept list with unique IDs", () => {
            const uniqueList = [validUuid, validUuid2];
            expect(schema.parse(uniqueList)).toEqual(uniqueList);
        });

        it("should reject list with duplicate IDs", () => {
            const duplicateList = [validUuid, validUuid, validUuid2];
            expect(() => schema.parse(duplicateList)).toThrow();
        });

        it("should accept single ID", () => {
            expect(schema.parse([validUuid])).toEqual([validUuid]);
        });

        it("should validate min/max constraints", () => {
            const schema = zUniqueIdList("IDs", MsgType.FieldName, 2, 3);
            expect(() => schema.parse([validUuid])).toThrow();
            expect(schema.parse([validUuid, validUuid2])).toEqual([validUuid, validUuid2]);
        });
    });

    describe("zPaginatedIdList", () => {
        const schema = zPaginatedIdList();

        it("should accept valid paginated ID list", () => {
            const validPaginated = {
                ids: [validUuid, validUuid2],
                page: 0,
                limit: 10
            };
            expect(schema.parse(validPaginated)).toEqual(validPaginated);
        });

        it("should accept paginated list with default limit", () => {
            const validPaginated = {
                ids: [validUuid],
                page: 0
            };
            const result = schema.parse(validPaginated);
            expect(result.limit).toBe(1); // default minItems
        });

        it("should reject negative page", () => {
            const invalidPaginated = {
                ids: [validUuid],
                page: -1,
                limit: 10
            };
            expect(() => schema.parse(invalidPaginated)).toThrow();
        });

        it("should reject invalid limit", () => {
            const invalidPaginated = {
                ids: [validUuid],
                page: 0,
                limit: -1
            };
            expect(() => schema.parse(invalidPaginated)).toThrow();
        });

        it("should reject limit exceeding max", () => {
            const schema = zPaginatedIdList("IDs", MsgType.FieldName, 1, 10);
            const invalidPaginated = {
                ids: [validUuid],
                page: 0,
                limit: 20
            };
            expect(() => schema.parse(invalidPaginated)).toThrow();
        });
    });

    describe("zBatchOperationResponse", () => {
        const schema = zBatchOperationResponse();

        it("should accept valid batch response", () => {
            const validResponse = {
                successIds: [validUuid, validUuid2],
                failedIds: [validUuid],
                errors: ["Error message"]
            };
            expect(schema.parse(validResponse)).toEqual(validResponse);
        });

        it("should accept response with empty success list", () => {
            const validResponse = {
                successIds: [],
                failedIds: [validUuid],
                errors: ["Error message"]
            };
            expect(schema.parse(validResponse)).toEqual(validResponse);
        });

        it("should accept response without optional fields", () => {
            const validResponse = {
                successIds: [validUuid]
            };
            expect(schema.parse(validResponse)).toEqual(validResponse);
        });

        it("should reject invalid structure", () => {
            const invalidResponse = {
                successIds: "not-an-array"
            };
            expect(() => schema.parse(invalidResponse)).toThrow();
        });
    });

    describe("zCustomId", () => {
        const hexValidator = (id: string) => /^[0-9a-fA-F]+$/.test(id);
        const schema = zCustomId(hexValidator, "Hex ID");

        it("should accept valid custom ID", () => {
            expect(schema.parse("abc123")).toBe("abc123");
            expect(schema.parse("123456")).toBe("123456");
        });

        it("should reject invalid custom ID", () => {
            expect(() => schema.parse("xyz123")).toThrow();
            expect(() => schema.parse("")).toThrow();
        });

        it("should reject non-string input", () => {
            expect(() => schema.parse(123)).toThrow();
            expect(() => schema.parse(null)).toThrow();
        });
    });

    describe("zMongoId", () => {
        const schema = zMongoId();

        it("should accept valid MongoDB ObjectId", () => {
            expect(schema.parse(validMongoId)).toBe(validMongoId);
            expect(schema.parse(validMongoId2)).toBe(validMongoId2);
        });

        it("should reject invalid MongoDB ObjectId", () => {
            expect(() => schema.parse(invalidMongoId)).toThrow();
            expect(() => schema.parse("123")).toThrow();
            expect(() => schema.parse("507f1f77bcf86cd79943901")).toThrow(); // too short
            expect(() => schema.parse("507f1f77bcf86cd7994390111")).toThrow(); // too long
        });

        it("should reject non-string input", () => {
            expect(() => schema.parse(123)).toThrow();
            expect(() => schema.parse(null)).toThrow();
            expect(() => schema.parse(undefined)).toThrow();
        });

        it("should accept mixed case", () => {
            expect(schema.parse("507F1F77BCF86CD799439011")).toBe("507F1F77BCF86CD799439011");
        });
    });

    describe("zMongoIdList", () => {
        const schema = zMongoIdList();

        it("should accept valid MongoDB ObjectId list", () => {
            const validList = [validMongoId, validMongoId2];
            expect(schema.parse(validList)).toEqual(validList);
        });

        it("should reject list with invalid MongoDB ObjectIds", () => {
            const invalidList = [validMongoId, invalidMongoId];
            expect(() => schema.parse(invalidList)).toThrow();
        });

        it("should validate min/max constraints", () => {
            const schema = zMongoIdList("IDs", MsgType.FieldName, 2, 3);
            expect(() => schema.parse([validMongoId])).toThrow();
            expect(schema.parse([validMongoId, validMongoId2])).toEqual([validMongoId, validMongoId2]);
        });

        it("should reject empty array by default", () => {
            expect(() => schema.parse([])).toThrow();
        });
    });

    describe("zFlexibleId", () => {
        const schema = zFlexibleId();

        it("should accept valid UUID", () => {
            expect(schema.parse(validUuid)).toBe(validUuid);
        });

        it("should accept valid MongoDB ObjectId", () => {
            expect(schema.parse(validMongoId)).toBe(validMongoId);
        });

        it("should reject invalid ID formats", () => {
            expect(() => schema.parse(invalidUuid)).toThrow();
            expect(() => schema.parse(invalidMongoId)).toThrow();
            expect(() => schema.parse("123")).toThrow();
        });

        it("should reject non-string input", () => {
            expect(() => schema.parse(123)).toThrow();
            expect(() => schema.parse(null)).toThrow();
            expect(() => schema.parse(undefined)).toThrow();
        });
    });

    describe("Custom Error Messages", () => {
        it("should use custom field name in error messages", () => {
            const schema = zIdListRequired("User IDs");
            try {
                schema.parse([]);
                fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.issues[0].message).toContain("User IDs");
            }
        });

        it("should use custom message when msgType is Message", () => {
            const schema = zIdListRequired("Custom error message", MsgType.Message);
            try {
                schema.parse([]);
                fail("Should have thrown an error");
            } catch (error: any) {
                expect(error.issues[0].message).toContain("Custom error message");
            }
        });
    });

    describe("Edge Cases", () => {
        it("should handle very long ID lists", () => {
            const longList = Array(100).fill(validUuid);
            const schema = zIdListOptional("IDs", MsgType.FieldName, 1, 100);
            expect(schema.parse(longList)).toEqual(longList);
        });

        it("should handle mixed case UUIDs", () => {
            const mixedCaseUuid = "123E4567-E89B-12D3-A456-426614174000";
            const schema = zIdListOptional();
            expect(schema.parse([mixedCaseUuid])).toEqual([mixedCaseUuid]);
        });

        it("should validate MongoDB ObjectId format strictly", () => {
            const schema = zMongoId();
            expect(() => schema.parse("507f1f77bcf86cd799439g11")).toThrow(); // invalid character 'g'
            expect(() => schema.parse("507f1f77bcf86cd799439 11")).toThrow(); // space
        });
    });
});
