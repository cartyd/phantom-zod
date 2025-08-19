# File Upload Schemas

The file upload schemas module provides comprehensive validation for file uploads with support for MIME types, file size limits, filename validation, and specialized schemas for images, documents, and multimedia content.

## Overview

This module offers robust file upload validation including MIME type checking, file size constraints, filename format validation, and specialized validators for different file categories. It supports both single and multiple file uploads with configurable limits and security features.

## Usage Patterns

### String Parameter Overloads (v1.5+)

Starting in v1.5, file upload schemas support simplified string parameter usage for basic field name specification:

```typescript
// Traditional options object
const fileTraditional = pz.FileUploadRequired({ msg: "Profile Picture" });

// Simplified string parameter (equivalent)
const fileSimple = pz.FileUploadRequired("Profile Picture");

// Both produce the same validation behavior
const fileInput = { filename: "photo.jpg", mimetype: "image/jpeg", size: 1024000 };
fileTraditional.parse(fileInput); // ✅ Valid file object
fileSimple.parse(fileInput);      // ✅ Valid file object

// Error messages are identical
fileTraditional.parse({ size: 999999999 }); // ❌ "Profile Picture exceeds maximum file size"
fileSimple.parse({ size: 999999999 });      // ❌ "Profile Picture exceeds maximum file size"
```

**When to use string parameters:**
- Basic field name specification only
- Default file size and MIME type restrictions are sufficient
- Cleaner, more concise code

**When to use options objects:**
- Custom file size limits needed (`maxSize`)
- MIME type restrictions required (`allowedTypes`)
- Custom message types (`MsgType.Message`)
- Advanced localization configurations

**Note:** Specialized schemas like `ImageUpload` and `DocumentUpload` have specific parameters and may not support string overloads in the same way as basic file upload schemas.

## Available Schemas

### Core File Schemas

- **`FileUploadRequired(config?, msg?, msgType?)`** - Validates required file uploads
- **`FileUploadOptional(config?, msg?, msgType?)`** - Validates optional file uploads (accepts undefined)
- **`MultipleFileUpload(config?, msg?, msgType?, maxFiles?)`** - Validates arrays of file uploads

### Specialized File Schemas

- **`ImageUpload(maxSize?, msg?, msgType?)`** - Validates image file uploads
- **`DocumentUpload(maxSize?, msg?, msgType?)`** - Validates document file uploads

### Component Schemas

- **`FileSize(maxSize, msg?, msgType?)`** - Validates file size in bytes
- **`MimeType(allowedTypes, msg?, msgType?)`** - Validates MIME type
- **`Filename(msg?, msgType?)`** - Validates filename format

## File Object Structure

```typescript
interface FileUpload {
  filename: string;        // Required: The filename
  mimetype: string;        // Required: MIME type
  size: number;           // Required: File size in bytes
  encoding?: string;      // Optional: File encoding
  originalName?: string;  // Optional: Original filename
  buffer?: Buffer;        // Optional: File buffer data
}
```

## MIME Type Constants

### Image Types

```typescript
const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/svg+xml"
] as const;
```

### Document Types

```typescript
const DOCUMENT_MIME_TYPES = [
  "application/pdf",                    // PDF
  "application/msword",                 // DOC
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/vnd.ms-excel",           // XLS
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
  "application/vnd.ms-powerpoint",      // PPT
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
  "text/plain",                         // TXT
  "text/csv",                          // CSV
  "application/rtf"                    // RTF
] as const;
```

### Media Types

```typescript
// Video MIME types
const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo",    // AVI
  "video/webm",
  "video/3gpp",
  "video/x-flv"
] as const;

// Audio MIME types  
const AUDIO_MIME_TYPES = [
  "audio/mpeg",         // MP3
  "audio/mp4",          // M4A
  "audio/wav",
  "audio/webm",
  "audio/ogg",
  "audio/aac",
  "audio/flac"
] as const;

// Archive MIME types
const ARCHIVE_MIME_TYPES = [
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed", 
  "application/gzip",
  "application/x-tar"
] as const;
```

## Examples

### Basic File Upload Validation

```typescript
import { pz } from 'phantom-zod';

// Required file upload
const fileSchema = FileUploadRequired();
const validFile = fileSchema.parse({
  filename: "document.pdf",
  mimetype: "application/pdf",
  size: 2048576, // 2MB
  encoding: "7bit",
  originalName: "My Document.pdf"
}); // ✓ Valid

// Optional file upload
const optionalFileSchema = FileUploadOptional();
optionalFileSchema.parse(undefined); // ✓ Valid
optionalFileSchema.parse(validFile); // ✓ Valid
```

### File Size Validation

```typescript
import { pz } from 'phantom-zod';

// 5MB file size limit
const limitedFileSchema = FileUploadRequired({
  maxSize: 5 * 1024 * 1024 // 5MB in bytes
});

limitedFileSchema.parse({
  filename: "image.jpg",
  mimetype: "image/jpeg",
  size: 3145728 // 3MB - ✓ Valid
});

limitedFileSchema.parse({
  filename: "large-image.jpg", 
  mimetype: "image/jpeg",
  size: 10485760 // 10MB - ✗ Error: File size exceeds limit
});
```

### MIME Type Restrictions

```typescript
import { pz } from 'phantom-zod';

// Images only
const imageOnlySchema = FileUploadRequired({
  allowedTypes: IMAGE_MIME_TYPES
});

imageOnlySchema.parse({
  filename: "photo.jpg",
  mimetype: "image/jpeg", // ✓ Valid
  size: 1048576
});

imageOnlySchema.parse({
  filename: "document.pdf",
  mimetype: "application/pdf", // ✗ Error: Invalid MIME type
  size: 1048576
});

// Documents only
const documentOnlySchema = FileUploadRequired({
  allowedTypes: DOCUMENT_MIME_TYPES
});

// Custom MIME types
const customSchema = FileUploadRequired({
  allowedTypes: ["image/png", "image/jpeg", "application/pdf"]
});
```

### Specialized File Upload Schemas

```typescript
import { pz } from 'phantom-zod';

// Image upload with 5MB limit
const profileImageSchema = ImageUpload(5 * 1024 * 1024, "Profile Image");

profileImageSchema.parse({
  filename: "avatar.png",
  mimetype: "image/png",
  size: 512000 // 500KB - ✓ Valid
});

// Document upload with 10MB limit
const attachmentSchema = DocumentUpload(10 * 1024 * 1024, "Document Attachment");

attachmentSchema.parse({
  filename: "report.pdf",
  mimetype: "application/pdf",
  size: 2097152 // 2MB - ✓ Valid
});
```

### Multiple File Uploads

```typescript
import { pz } from 'phantom-zod';

// Multiple image uploads (max 5 files)
const gallerySchema = MultipleFileUpload(
  {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: IMAGE_MIME_TYPES,
    requireExtension: true
  },
  "Gallery Images",
  MsgType.FieldName,
  5 // maxFiles
);

const validGallery = gallerySchema.parse([
  {
    filename: "photo1.jpg",
    mimetype: "image/jpeg",
    size: 1048576
  },
  {
    filename: "photo2.png", 
    mimetype: "image/png",
    size: 2097152
  }
]); // ✓ Valid

// Too many files
gallerySchema.parse([
  // ... 6 files would cause ✗ Error: Too many files
]);
```

### Filename Validation

```typescript
import { pz } from 'phantom-zod';

const filenameSchema = Filename();

// Valid filenames
filenameSchema.parse("document.pdf");     // ✓ Valid
filenameSchema.parse("my-file_v2.docx");  // ✓ Valid
filenameSchema.parse("image (1).jpg");    // ✓ Valid

// Invalid filenames
filenameSchema.parse(".hidden-file");     // ✗ Error: Cannot start with dot
filenameSchema.parse("file.");            // ✗ Error: Cannot end with dot
filenameSchema.parse("file<name>.txt");   // ✗ Error: Invalid characters
filenameSchema.parse("file|name.pdf");    // ✗ Error: Invalid characters
```

### Custom Configuration

```typescript
import { pz } from 'phantom-zod';

// Custom file validation with all options
const customFileSchema = FileUploadRequired({
  maxSize: 20 * 1024 * 1024,     // 20MB
  allowedTypes: [
    "application/pdf",
    "application/msword",
    "image/jpeg",
    "image/png"
  ],
  requireExtension: true          // Filename must have extension
}, "Upload File");

// Requires extension
customFileSchema.parse({
  filename: "document",           // ✗ Error: Extension required
  mimetype: "application/pdf",
  size: 1048576
});

customFileSchema.parse({
  filename: "document.pdf",       // ✓ Valid
  mimetype: "application/pdf", 
  size: 1048576
});
```

### Form Integration Examples

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// User profile form with avatar
const profileFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  avatar: ImageUpload(5 * 1024 * 1024, "Profile Avatar").optional(),
  bio: z.string().optional()
});

// Document submission form
const documentSubmissionSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  primaryDocument: DocumentUpload(10 * 1024 * 1024, "Primary Document"),
  supportingDocuments: MultipleFileUpload({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["application/pdf", "image/jpeg", "image/png"]
  }, "Supporting Documents", MsgType.FieldName, 3).optional()
});

// Media upload form
const mediaUploadSchema = z.object({
  title: z.string(),
  thumbnail: ImageUpload(2 * 1024 * 1024, "Thumbnail"),
  mediaFiles: MultipleFileUpload({
    maxSize: 50 * 1024 * 1024,
    allowedTypes: [...VIDEO_MIME_TYPES, ...AUDIO_MIME_TYPES]
  }, "Media Files", MsgType.FieldName, 10)
});
```

## Error Messages

The file upload schemas provide specific error messages for validation failures:

- **File required**: "File is required"
- **File size exceeded**: "File size exceeds maximum limit of {maxSize} bytes"
- **Invalid MIME type**: "Invalid file type. Allowed types: {allowedTypes}"
- **Invalid filename**: "Invalid filename format"
- **Extension required**: "Filename must include a file extension"
- **Too many files**: "Too many files. Maximum allowed: {maxFiles}"

## TypeScript Types

```typescript
// File upload types
type FileUpload = {
  filename: string;
  mimetype: string;
  size: number;
  encoding?: string;
  originalName?: string;
  buffer?: Buffer;
};

type FileUploadOptional = FileUpload | undefined;

// MIME type constants
type ImageMimeType = typeof IMAGE_MIME_TYPES[number];
type DocumentMimeType = typeof DOCUMENT_MIME_TYPES[number];
type VideoMimeType = typeof VIDEO_MIME_TYPES[number];
type AudioMimeType = typeof AUDIO_MIME_TYPES[number];

// Configuration types
interface FileUploadConfig {
  maxSize?: number;
  allowedTypes?: readonly string[];
  requireExtension?: boolean;
}

// Usage with schemas
const schema = FileUploadRequired();
type InferredType = z.infer<typeof schema>; // FileUpload

const multipleSchema = MultipleFileUpload();
type MultipleType = z.infer<typeof multipleSchema>; // FileUpload[]
```

## Utility Functions

### Format File Size

```typescript
import { pz } from 'phantom-zod';

// Format bytes into human-readable format
console.log(formatBytes(1024));           // "1 KB"
console.log(formatBytes(1048576));        // "1 MB" 
console.log(formatBytes(1073741824));     // "1 GB"
console.log(formatBytes(1536, 1));        // "1.5 KB"

// Use in validation messages
const maxSize = 5 * 1024 * 1024;
console.log(`Maximum file size: ${formatBytes(maxSize)}`); // "Maximum file size: 5 MB"
```

### File Extension Handling

```typescript
import { pz } from 'phantom-zod';

// Get file extension
console.log(getFileExtension("document.pdf"));     // "pdf"
console.log(getFileExtension("image.jpeg"));       // "jpeg"
console.log(getFileExtension("no-extension"));     // ""

// Validate extension matches MIME type
console.log(isExtensionMatchingMimeType("image.jpg", "image/jpeg"));    // true
console.log(isExtensionMatchingMimeType("document.pdf", "application/pdf")); // true
console.log(isExtensionMatchingMimeType("image.jpg", "application/pdf"));    // false
```

## Best Practices

### Security Considerations

```typescript
import { pz } from 'phantom-zod';

// Always validate both MIME type and extension
const secureFileSchema = FileUploadRequired({
  allowedTypes: ["application/pdf", "image/jpeg", "image/png"],
  requireExtension: true
}).refine((file) => {
  // Additional security: verify extension matches MIME type
  return isExtensionMatchingMimeType(file.filename, file.mimetype);
}, {
  message: "File extension does not match MIME type"
});

// Virus scanning integration
const virusScanSchema = FileUploadRequired().refine(async (file) => {
  if (file.buffer) {
    // Integrate with virus scanning service
    const scanResult = await virusScanner.scanBuffer(file.buffer);
    return scanResult.isClean;
  }
  return true;
}, {
  message: "File failed security scan"
});
```

### File Size Management

```typescript
import { pz } from 'phantom-zod';

// Progressive file size limits based on type
const adaptiveFileSchema = (mimetype: string) => {
  let maxSize: number;
  
  if (mimetype.startsWith('image/')) {
    maxSize = 5 * 1024 * 1024; // 5MB for images
  } else if (mimetype.startsWith('video/')) {
    maxSize = 100 * 1024 * 1024; // 100MB for videos
  } else if (mimetype === 'application/pdf') {
    maxSize = 10 * 1024 * 1024; // 10MB for PDFs
  } else {
    maxSize = 2 * 1024 * 1024; // 2MB default
  }
  
  return FileUploadRequired({
    maxSize,
    allowedTypes: [mimetype]
  });
};

// User-friendly size limits
const createFileLimitMessage = (maxSize: number) => {
  return `Maximum file size: ${formatBytes(maxSize)}`;
};
```

### Content Validation

```typescript
import { pz } from 'phantom-zod';

// Image dimension validation
const profileImageSchema = ImageUpload(5 * 1024 * 1024, "Profile Image")
  .refine(async (file) => {
    if (file.buffer && file.mimetype.startsWith('image/')) {
      // Use image processing library to check dimensions
      const dimensions = await getImageDimensions(file.buffer);
      return dimensions.width >= 100 && dimensions.height >= 100;
    }
    return true;
  }, {
    message: "Image must be at least 100x100 pixels"
  });

// Document page limit validation
const contractSchema = DocumentUpload(20 * 1024 * 1024, "Contract")
  .refine(async (file) => {
    if (file.buffer && file.mimetype === 'application/pdf') {
      const pageCount = await getPdfPageCount(file.buffer);
      return pageCount <= 50;
    }
    return true;
  }, {
    message: "PDF must not exceed 50 pages"
  });
```

### Multiple File Handling

```typescript
import { pz } from 'phantom-zod';

// Project file upload with mixed types
const projectFilesSchema = MultipleFileUpload({
  maxSize: 25 * 1024 * 1024,
  allowedTypes: [
    ...IMAGE_MIME_TYPES,
    ...DOCUMENT_MIME_TYPES,
    "application/zip"
  ]
}, "Project Files", MsgType.FieldName, 10)
  .refine((files) => {
    // Total size limit across all files
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    return totalSize <= 100 * 1024 * 1024; // 100MB total
  }, {
    message: "Total file size cannot exceed 100MB"
  })
  .refine((files) => {
    // At least one document required
    const hasDocument = files.some(file => 
      DOCUMENT_MIME_TYPES.includes(file.mimetype as any)
    );
    return hasDocument;
  }, {
    message: "At least one document file is required"
  });
```

## Integration Examples

### React Hook Form with File Upload

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pz } from 'phantom-zod';

const fileFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  coverImage: ImageUpload(5 * 1024 * 1024, "Cover Image"),
  attachments: DocumentUpload(10 * 1024 * 1024, "Attachments").optional()
});

function FileUploadForm() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(fileFormSchema)
  });

  const handleFileChange = (fieldName: string, files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      
      // Create file object for validation
      const fileObject = {
        filename: file.name,
        mimetype: file.type,
        size: file.size,
        encoding: 'binary',
        originalName: file.name
      };
      
      setValue(fieldName, fileObject);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} placeholder="Title" />
      <textarea {...register('description')} placeholder="Description" />
      
      <div>
        <label>Cover Image (max 5MB)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange('coverImage', e.target.files)}
        />
        {errors.coverImage && <span>{errors.coverImage.message}</span>}
      </div>

      <div>
        <label>Attachments (optional, max 10MB)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => handleFileChange('attachments', e.target.files)}
        />
        {errors.attachments && <span>{errors.attachments.message}</span>}
      </div>

      <button type="submit">Upload</button>
    </form>
  );
}
```

### Express.js with Multer

```typescript
import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { pz } from 'phantom-zod';

const app = express();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
});

// Single image upload endpoint
const imageUploadSchema = ImageUpload(5 * 1024 * 1024, "Profile Image");

app.post('/api/upload/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileData = {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      encoding: req.file.encoding,
      buffer: req.file.buffer
    };

    const validFile = imageUploadSchema.parse(fileData);
    
    // Process file (save to storage, database, etc.)
    const fileUrl = processImageUpload(validFile);
    
    res.json({ success: true, fileUrl });
  } catch (error) {
    res.status(400).json({ 
      error: 'File validation failed',
      details: error.errors 
    });
  }
});

// Multiple document upload endpoint
const documentArraySchema = MultipleFileUpload({
  maxSize: 10 * 1024 * 1024,
  allowedTypes: ["application/pdf", "application/msword", "text/plain"]
}, "Documents", MsgType.FieldName, 5);

app.post('/api/upload/documents', upload.array('documents', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const filesData = (req.files as Express.Multer.File[]).map(file => ({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      encoding: file.encoding,
      buffer: file.buffer
    }));

    const validFiles = documentArraySchema.parse(filesData);
    
    // Process files
    const fileUrls = processDocumentUploads(validFiles);
    
    res.json({ success: true, fileUrls });
  } catch (error) {
    res.status(400).json({ 
      error: 'File validation failed',
      details: error.errors 
    });
  }
});

// Mixed file upload with metadata
const mixedUploadSchema = z.object({
  title: z.string().min(1),
  category: z.string(),
  thumbnail: ImageUpload(2 * 1024 * 1024, "Thumbnail"),
  content: DocumentUpload(15 * 1024 * 1024, "Content")
});

app.post('/api/upload/mixed', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'content', maxCount: 1 }
]), (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    const requestData = {
      title: req.body.title,
      category: req.body.category,
      thumbnail: files.thumbnail?.[0] ? {
        filename: files.thumbnail[0].originalname,
        mimetype: files.thumbnail[0].mimetype,
        size: files.thumbnail[0].size,
        buffer: files.thumbnail[0].buffer
      } : undefined,
      content: files.content?.[0] ? {
        filename: files.content[0].originalname,
        mimetype: files.content[0].mimetype,
        size: files.content[0].size,
        buffer: files.content[0].buffer
      } : undefined
    };

    const validData = mixedUploadSchema.parse(requestData);
    
    // Process mixed upload
    const result = processMixedUpload(validData);
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ 
      error: 'Upload validation failed',
      details: error.errors 
    });
  }
});
```

### Database Models

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// File metadata model
export const FileModel = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  originalName: z.string(),
  mimetype: z.string(),
  size: z.number(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  uploadedBy: z.string().uuid(),
  uploadedAt: z.date(),
  lastAccessed: z.date().optional(),
  downloadCount: z.number().default(0),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

// User profile with avatar
export const UserProfileModel = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  avatar: FileModel.pick({
    id: true,
    url: true,
    thumbnailUrl: true
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Document with attachments
export const DocumentModel = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  attachments: z.array(FileModel),
  coverImage: FileModel.optional(),
  authorId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional()
});

// Media gallery
export const MediaGalleryModel = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  images: z.array(FileModel.extend({
    alt: z.string().optional(),
    caption: z.string().optional(),
    order: z.number()
  })),
  createdAt: z.date()
});
```

### File Processing Service

```typescript
import { pz } from 'phantom-zod';
import fs from 'fs/promises';
import path from 'path';

class FileProcessingService {
  private uploadDir = './uploads';
  private maxStorageSize = 1024 * 1024 * 1024; // 1GB

  // Process single file upload
  async processFileUpload(fileData: unknown, userId: string) {
    const fileSchema = FileUploadRequired();
    const validFile = fileSchema.parse(fileData);
    
    // Check available storage
    await this.checkStorageLimit();
    
    // Generate unique filename
    const uniqueFilename = this.generateUniqueFilename(validFile.filename);
    const filePath = path.join(this.uploadDir, uniqueFilename);
    
    // Save file to disk
    if (validFile.buffer) {
      await fs.writeFile(filePath, validFile.buffer);
    }
    
    // Create file record
    const fileRecord = {
      id: generateUUID(),
      filename: uniqueFilename,
      originalName: validFile.originalName || validFile.filename,
      mimetype: validFile.mimetype,
      size: validFile.size,
      url: `/uploads/${uniqueFilename}`,
      uploadedBy: userId,
      uploadedAt: new Date()
    };
    
    // Save to database
    await this.saveFileRecord(fileRecord);
    
    // Generate thumbnail for images
    if (validFile.mimetype.startsWith('image/')) {
      const thumbnailUrl = await this.generateThumbnail(filePath, uniqueFilename);
      fileRecord.thumbnailUrl = thumbnailUrl;
    }
    
    return fileRecord;
  }
  
  // Process multiple files
  async processMultipleFileUploads(filesData: unknown[], userId: string) {
    const results = [];
    
    for (const fileData of filesData) {
      try {
        const result = await this.processFileUpload(fileData, userId);
        results.push({ success: true, file: result });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.message,
          filename: (fileData as any)?.filename 
        });
      }
    }
    
    return results;
  }
  
  // Validate file before processing
  validateFile(fileData: unknown, config?: {
    maxSize?: number;
    allowedTypes?: string[];
  }) {
    const schema = FileUploadRequired({
      maxSize: config?.maxSize,
      allowedTypes: config?.allowedTypes
    });
    
    return schema.safeParse(fileData);
  }
  
  // Get file information
  getFileInfo(filename: string) {
    const extension = getFileExtension(filename);
    const stats = fs.stat(path.join(this.uploadDir, filename));
    
    return {
      filename,
      extension,
      size: stats.size,
      sizeFormatted: formatBytes(stats.size),
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    };
  }
  
  private generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = getFileExtension(originalFilename);
    return `${timestamp}_${random}.${extension}`;
  }
  
  private async checkStorageLimit() {
    const stats = await fs.stat(this.uploadDir);
    if (stats.size > this.maxStorageSize) {
      throw new Error(`Storage limit exceeded: ${formatBytes(this.maxStorageSize)}`);
    }
  }
  
  private async saveFileRecord(fileRecord: any) {
    // Implementation would save to database
    console.log('Saving file record:', fileRecord);
  }
  
  private async generateThumbnail(filePath: string, filename: string): Promise<string> {
    // Implementation would generate thumbnail using image processing library
    return `/thumbnails/thumb_${filename}`;
  }
}

const fileProcessingService = new FileProcessingService();
export { fileProcessingService };
```

## Advanced Use Cases

### Progressive File Upload

```typescript
import { pz } from 'phantom-zod';

// Chunked file upload validation
const chunkSchema = z.object({
  filename: z.string(),
  chunkIndex: z.number().int().min(0),
  totalChunks: z.number().int().positive(),
  chunkData: z.instanceof(Buffer),
  fileSize: z.number().positive(),
  mimetype: z.string()
});

// Resume upload validation
const resumeUploadSchema = z.object({
  uploadId: z.string().uuid(),
  resumeFrom: z.number().int().min(0),
  totalSize: z.number().positive(),
  expectedHash: z.string().optional()
});
```

### Cloud Storage Integration

```typescript
import { pz } from 'phantom-zod';

// Cloud upload metadata
const cloudUploadSchema = FileUploadRequired().extend({
  storageProvider: z.enum(['aws', 'gcp', 'azure']),
  bucket: z.string(),
  region: z.string(),
  encryption: z.boolean().default(true),
  publicAccess: z.boolean().default(false)
});

// CDN configuration
const cdnConfigSchema = z.object({
  fileId: z.string().uuid(),
  cdnUrl: z.string().url(),
  cacheControl: z.string().default('public, max-age=31536000'),
  compressionEnabled: z.boolean().default(true)
});
```

### File Content Analysis

```typescript
import { pz } from 'phantom-zod';

// Content analysis result
const contentAnalysisSchema = z.object({
  fileId: z.string().uuid(),
  textContent: z.string().optional(),
  language: z.string().optional(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
  keywords: z.array(z.string()).optional(),
  entities: z.array(z.object({
    type: z.string(),
    value: z.string(),
    confidence: z.number().min(0).max(1)
  })).optional(),
  safetyRating: z.enum(['safe', 'unsafe', 'unknown']).default('unknown')
});
```

## See Also

- [String Schemas](./string-schemas.md) - For filename validation
- [Number Schemas](./number-schemas.md) - For file size validation
- [Array Schemas](./array-schemas.md) - For multiple file uploads
- [Enum Schemas](./enum-schemas.md) - For MIME type validation
- [Object Validation Guide](../guides/object-validation.md) - Complex object validation patterns
