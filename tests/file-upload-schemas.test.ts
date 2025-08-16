import { IMAGE_MIME_TYPES, DOCUMENT_MIME_TYPES, VIDEO_MIME_TYPES, AUDIO_MIME_TYPES, ARCHIVE_MIME_TYPES, ALL_MIME_TYPES, createFileUploadSchemas, formatBytes, getFileExtension, isExtensionMatchingMimeType } from "../src/schemas/file-upload-schemas";
import { MsgType } from "../src/common/types/msg-type";
import { createTestMessageHandler } from "../src/localization/types/message-handler.types";

describe("File Upload Schemas", () => {
    const messageHandler = createTestMessageHandler();
    const {
        FileSize,
        MimeType,
        Filename,
        FileUploadOptional,
        FileUploadRequired,
        ImageUpload,
        DocumentUpload,
        MultipleFileUpload,
    } = createFileUploadSchemas(messageHandler);
    describe("FileUploadOptional", () => {
        const schema = FileUploadOptional();

        it("should accept undefined", () => {
            expect(schema.parse(undefined)).toBe(undefined);
        });

        it("should accept valid file object", () => {
            const validFile = {
                filename: "test.jpg",
                mimetype: "image/jpeg",
                size: 5000,
                encoding: "7bit",
                originalName: "test-original.jpg",
                buffer: Buffer.from("test")
            };
            expect(schema.parse(validFile)).toEqual(validFile);
        });

        it("should reject invalid file object", () => {
            const invalidFile = {
                filename: "test",
                size: 5000,
            };
            expect(() => schema.parse(invalidFile)).toThrow();
        });

        it("should validate file size constraints", () => {
            const schema = FileUploadOptional({ maxSize: 1000 });
            const oversizedFile = {
                filename: "large.jpg",
                mimetype: "image/jpeg",
                size: 5000,
                buffer: Buffer.from("test")
            };
            expect(() => schema.parse(oversizedFile)).toThrow();
        });

        it("should validate allowed file types", () => {
            const schema = FileUploadOptional({ allowedTypes: IMAGE_MIME_TYPES });
            const wrongTypeFile = {
                filename: "document.pdf",
                mimetype: "application/pdf",
                size: 1000,
                buffer: Buffer.from("test")
            };
            expect(() => schema.parse(wrongTypeFile)).toThrow();
        });

        it("should require file extension when specified", () => {
            const schema = FileUploadOptional({ requireExtension: true });
            const noExtensionFile = {
                filename: "filename",
                mimetype: "image/jpeg",
                size: 1000,
                buffer: Buffer.from("test")
            };
            expect(() => schema.parse(noExtensionFile)).toThrow();
        });
    });

    describe("FileUploadRequired", () => {
        const schema = FileUploadRequired();

        it("should accept valid file object", () => {
            const validFile = {
                filename: "test.docx",
                mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                size: 10240,
                encoding: "7bit",
                originalName: "test-original.docx",
                buffer: Buffer.from("test")
            };
            expect(schema.parse(validFile)).toEqual(validFile);
        });

        it("should reject undefined", () => {
            expect(() => schema.parse(undefined)).toThrow();
        });

        it("should reject null", () => {
            expect(() => schema.parse(null)).toThrow();
        });
    });

    describe("ImageUpload", () => {
        const schema = ImageUpload();

        it("should accept valid image file", () => {
            const validImage = {
                filename: "photo.png",
                mimetype: "image/png",
                size: 2048,
                buffer: Buffer.from("image")
            };
            const result = schema.parse(validImage);
            expect(result.filename).toBe(validImage.filename);
            expect(result.mimetype).toBe(validImage.mimetype);
            expect(result.size).toBe(validImage.size);
            expect(result.buffer).toEqual(validImage.buffer);
        });

        it("should reject non-image file", () => {
            const invalidImage = {
                filename: "video.mp4",
                mimetype: "video/mp4",
                size: 2048,
                buffer: Buffer.from("video")
            };
            expect(() => schema.parse(invalidImage)).toThrow();
        });

        it("should reject files exceeding size limit", () => {
            const schema = ImageUpload(1024); // 1KB limit
            const oversizedImage = {
                filename: "large.jpg",
                mimetype: "image/jpeg",
                size: 2048,
                buffer: Buffer.from("image")
            };
            expect(() => schema.parse(oversizedImage)).toThrow();
        });

        it("should accept various image formats", () => {
            const imageFormats = [
                { filename: "photo.jpg", mimetype: "image/jpeg" },
                { filename: "photo.png", mimetype: "image/png" },
                { filename: "photo.gif", mimetype: "image/gif" },
                { filename: "photo.webp", mimetype: "image/webp" },
            ];

            imageFormats.forEach(format => {
                const validImage = {
                    ...format,
                    size: 2048,
                    buffer: Buffer.from("image")
                };
                expect(() => schema.parse(validImage)).not.toThrow();
            });
        });
    });

    describe("DocumentUpload", () => {
        const schema = DocumentUpload();

        it("should accept valid document file", () => {
            const validDoc = {
                filename: "document.pdf",
                mimetype: "application/pdf",
                size: 4096,
                buffer: Buffer.from("document")
            };
            const result = schema.parse(validDoc);
            expect(result.filename).toBe(validDoc.filename);
            expect(result.mimetype).toBe(validDoc.mimetype);
            expect(result.size).toBe(validDoc.size);
            expect(result.buffer).toEqual(validDoc.buffer);
        });

        it("should reject non-document file", () => {
            const invalidDoc = {
                filename: "music.mp3",
                mimetype: "audio/mpeg",
                size: 4096,
                buffer: Buffer.from("music")
            };
            expect(() => schema.parse(invalidDoc)).toThrow();
        });

        it("should accept various document formats", () => {
            const documentFormats = [
                { filename: "doc.pdf", mimetype: "application/pdf" },
                { filename: "doc.docx", mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
                { filename: "doc.txt", mimetype: "text/plain" },
                { filename: "doc.csv", mimetype: "text/csv" },
            ];

            documentFormats.forEach(format => {
                const validDoc = {
                    ...format,
                    size: 4096,
                    buffer: Buffer.from("document")
                };
                expect(() => schema.parse(validDoc)).not.toThrow();
            });
        });
    });

    describe("MultipleFileUpload", () => {
        const schema = MultipleFileUpload();

        it("should accept multiple valid files", () => {
            const validFiles = [
                {
                    filename: "file1.txt",
                    mimetype: "text/plain",
                    size: 1000,
                    buffer: Buffer.from("text")
                },
                {
                    filename: "file2.csv",
                    mimetype: "text/csv",
                    size: 2000,
                    buffer: Buffer.from("csv")
                }
            ];
            const result = schema.parse(validFiles);
            expect(result).toHaveLength(2);
            expect(result[0].filename).toBe("file1.txt");
            expect(result[0].mimetype).toBe("text/plain");
            expect(result[0].size).toBe(1000);
            expect(result[1].filename).toBe("file2.csv");
            expect(result[1].mimetype).toBe("text/csv");
            expect(result[1].size).toBe(2000);
        });

        it("should reject if more than max files", () => {
            const tooManyFiles = Array(10).fill({
                filename: "file.jpg",
                mimetype: "image/jpeg",
                size: 1024,
                buffer: Buffer.from("image")
            });
            expect(() => schema.parse(tooManyFiles)).toThrow();
        });

        it("should reject empty array", () => {
            expect(() => schema.parse([])).toThrow();
        });

        it("should accept custom max files limit", () => {
            const schema = MultipleFileUpload({}, "Files", MsgType.FieldName, 2);
            const validFiles = [
                {
                    filename: "file1.txt",
                    mimetype: "text/plain",
                    size: 1000,
                    buffer: Buffer.from("text")
                },
                {
                    filename: "file2.txt",
                    mimetype: "text/plain",
                    size: 1000,
                    buffer: Buffer.from("text")
                }
            ];
            const result = schema.parse(validFiles);
            expect(result).toHaveLength(2);
            expect(result[0].filename).toBe("file1.txt");
            expect(result[0].mimetype).toBe("text/plain");
            expect(result[0].size).toBe(1000);
            expect(result[1].filename).toBe("file2.txt");
            expect(result[1].mimetype).toBe("text/plain");
            expect(result[1].size).toBe(1000);
        });
    });

    describe("FileSize", () => {
        it("should validate file size", () => {
            const schema = FileSize(1000);
            expect(schema.parse(500)).toBe(500);
            expect(() => schema.parse(1500)).toThrow();
        });

        it("should reject negative sizes", () => {
            const schema = FileSize(1000);
            expect(() => schema.parse(-100)).toThrow();
        });

        it("should reject zero size", () => {
            const schema = FileSize(1000);
            expect(() => schema.parse(0)).toThrow();
        });
    });

    describe("MimeType", () => {
        it("should validate allowed MIME types", () => {
            const schema = MimeType(IMAGE_MIME_TYPES);
            expect(schema.parse("image/jpeg")).toBe("image/jpeg");
            expect(() => schema.parse("video/mp4")).toThrow();
        });
    });

    describe("Filename", () => {
        it("should accept valid filenames", () => {
            const schema = Filename();
            expect(schema.parse("document.pdf")).toBe("document.pdf");
            expect(schema.parse("image file.jpg")).toBe("image file.jpg");
        });

        it("should reject invalid characters", () => {
            const schema = Filename();
            expect(() => schema.parse("file<name.txt")).toThrow();
            expect(() => schema.parse("file>name.txt")).toThrow();
            expect(() => schema.parse("file:name.txt")).toThrow();
            expect(() => schema.parse("file\"name.txt")).toThrow();
        });

        it("should reject filenames starting or ending with dot", () => {
            const schema = Filename();
            expect(() => schema.parse(".hiddenfile")).toThrow();
            expect(() => schema.parse("filename.")).toThrow();
        });
    });

    describe("Utility Functions", () => {
        describe("formatBytes", () => {
            it("should format bytes correctly", () => {
                expect(formatBytes(0)).toBe("0 Bytes");
                expect(formatBytes(1024)).toBe("1 KB");
                expect(formatBytes(1024 * 1024)).toBe("1 MB");
                expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
            });

            it("should handle decimal places", () => {
                expect(formatBytes(1536, 1)).toBe("1.5 KB");
                expect(formatBytes(1536, 0)).toBe("2 KB");
            });
        });

        describe("getFileExtension", () => {
            it("should extract file extension", () => {
                expect(getFileExtension("document.pdf")).toBe("pdf");
                expect(getFileExtension("image.JPEG")).toBe("jpeg");
                expect(getFileExtension("archive.tar.gz")).toBe("gz");
            });

            it("should return empty string for no extension", () => {
                expect(getFileExtension("filename")).toBe("");
            });
        });

        describe("isExtensionMatchingMimeType", () => {
            it("should validate extension-mime type matching", () => {
                expect(isExtensionMatchingMimeType("image.jpg", "image/jpeg")).toBe(true);
                expect(isExtensionMatchingMimeType("image.jpeg", "image/jpeg")).toBe(true);
                expect(isExtensionMatchingMimeType("document.pdf", "application/pdf")).toBe(true);
                expect(isExtensionMatchingMimeType("image.jpg", "application/pdf")).toBe(false);
            });

            it("should handle unknown mime types", () => {
                expect(isExtensionMatchingMimeType("file.unknown", "application/unknown")).toBe(false);
            });
        });
    });

    describe("MIME Type Constants", () => {
        it("should contain expected image MIME types", () => {
            expect(IMAGE_MIME_TYPES).toContain("image/jpeg");
            expect(IMAGE_MIME_TYPES).toContain("image/png");
            expect(IMAGE_MIME_TYPES).toContain("image/gif");
        });

        it("should contain expected document MIME types", () => {
            expect(DOCUMENT_MIME_TYPES).toContain("application/pdf");
            expect(DOCUMENT_MIME_TYPES).toContain("text/plain");
            expect(DOCUMENT_MIME_TYPES).toContain("text/csv");
        });

        it("should contain expected video MIME types", () => {
            expect(VIDEO_MIME_TYPES).toContain("video/mp4");
            expect(VIDEO_MIME_TYPES).toContain("video/webm");
        });

        it("should contain expected audio MIME types", () => {
            expect(AUDIO_MIME_TYPES).toContain("audio/mpeg");
            expect(AUDIO_MIME_TYPES).toContain("audio/wav");
        });

        it("should contain expected archive MIME types", () => {
            expect(ARCHIVE_MIME_TYPES).toContain("application/zip");
            expect(ARCHIVE_MIME_TYPES).toContain("application/gzip");
        });

        it("should combine all MIME types", () => {
            expect(ALL_MIME_TYPES.length).toBeGreaterThan(IMAGE_MIME_TYPES.length);
            expect(ALL_MIME_TYPES).toContain("image/jpeg");
            expect(ALL_MIME_TYPES).toContain("application/pdf");
            expect(ALL_MIME_TYPES).toContain("video/mp4");
        });
    });
});
