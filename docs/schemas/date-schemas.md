# Date Schemas

Date schemas provide comprehensive date and time validation with support for Date objects, ISO date strings, datetime strings, and time strings with automatic parsing and flexible input formats.

## Overview

All date schemas in Phantom Zod provide:

- **Multiple input formats** - Date objects, ISO strings, date strings, datetime strings
- **Automatic conversion** between Date objects and string representations
- **ISO 8601 compliance** for string formats
- **Date range validation** with minimum and maximum constraints
- **Consistent error handling** through localization
- **Type safety** with TypeScript inference

## Usage Patterns

### String Parameter Overloads (v1.5+)

Starting in v1.5, all date schemas support simplified string parameter usage for basic field name specification:

```typescript
// Traditional options object
const birthdateTraditional = pz.DateStringRequired({ msg: "Birth Date" });

// Simplified string parameter (equivalent)
const birthdateSimple = pz.DateStringRequired("Birth Date");

// Both produce the same validation behavior
const dateInput = "1990-05-15";
birthdateTraditional.parse(dateInput); // ✅ "1990-05-15"
birthdateSimple.parse(dateInput);      // ✅ "1990-05-15"

// Error messages are identical
birthdateTraditional.parse("invalid"); // ❌ "Birth Date must be a valid date"
birthdateSimple.parse("invalid");      // ❌ "Birth Date must be a valid date"
```

**When to use string parameters:**
- Basic field name specification only
- Default validation behavior is sufficient
- Cleaner, more concise code

**When to use options objects:**
- Date range constraints needed (`min`, `max`)
- Custom message types (`MsgType.Message`)
- Advanced localization configurations

## Available Schemas

### Date Object Schemas

#### DateRequired

Creates a required Date schema that accepts Date objects and date strings, returning a Date object.

```typescript
pz.DateRequired(options?: DateSchemaOptions)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `msg` | `string` | `"Date"` | Field name or custom error message |
| `msgType` | `MsgType` | `MsgType.FieldName` | Message type for localization |
| `min` | `Date` | `undefined` | Minimum date (inclusive) |
| `max` | `Date` | `undefined` | Maximum date (inclusive) |

**Examples:**

```typescript
import { pz } from "phantom-zod";

const schema = pz.DateRequired({ msg: "Birth Date" });

// Valid inputs - all return Date objects
schema.parse(new Date());              // ✅ Date object
schema.parse(new Date("2023-01-01"));  // ✅ Date object
schema.parse("2023-01-01");            // ✅ Date object (converted)
schema.parse("2023-12-25");            // ✅ Date object (converted)

// Invalid inputs
schema.parse("");                      // ❌ Error: Birth Date must be a valid date
schema.parse("invalid-date");          // ❌ Error: Birth Date must be a valid date
schema.parse("2023-13-01");            // ❌ Error: Birth Date must be a valid date
schema.parse(null);                    // ❌ Error: Birth Date must be a valid date
schema.parse(undefined);               // ❌ Error: Birth Date is required
```

**With Date Range Constraints:**
```typescript
const birthdateSchema = pz.DateRequired({
  msg: "Birth Date",
  min: new Date("1900-01-01"),
  max: new Date()  // Today
});

birthdateSchema.parse("1990-05-15");   // ✅ Valid date in range
birthdateSchema.parse("1850-01-01");   // ❌ Error: Birth Date is invalid (before min)
birthdateSchema.parse("2030-01-01");   // ❌ Error: Birth Date is invalid (after max)
```

#### DateOptional

Creates an optional Date schema that accepts Date objects, date strings, or undefined.

```typescript
pz.DateOptional(options?: DateSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.DateOptional({ msg: "End Date" });

// Valid inputs
schema.parse(new Date());              // ✅ Date object
schema.parse("2023-01-01");            // ✅ Date object (converted)
schema.parse(undefined);               // ✅ undefined

// Invalid inputs
schema.parse("invalid");               // ❌ Error: End Date must be a valid date
```

### Date String Schemas

#### DateStringRequired

Creates a required schema that accepts Date objects and date strings, returning an ISO date string (YYYY-MM-DD).

```typescript
pz.DateStringRequired(options?: DateSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.DateStringRequired({ msg: "Event Date" });

// Valid inputs - all return ISO date strings
schema.parse("2023-01-01");                    // ✅ "2023-01-01"
schema.parse(new Date("2023-01-01"));          // ✅ "2023-01-01"
schema.parse(new Date("2023-01-01T15:30:00")); // ✅ "2023-01-01"

// Invalid inputs
schema.parse("01/01/2023");            // ❌ Error: Event Date must be a valid date
schema.parse("January 1, 2023");       // ❌ Error: Event Date must be a valid date
```

#### DateStringOptional

Creates an optional schema that returns ISO date strings or undefined.

```typescript
const schema = pz.DateStringOptional({ msg: "Completion Date" });

schema.parse("2023-01-01");            // ✅ "2023-01-01"
schema.parse(new Date("2023-01-01"));  // ✅ "2023-01-01"
schema.parse(undefined);               // ✅ undefined
```

### DateTime Schemas

#### DateTimeRequired

Creates a required schema that accepts Date objects and datetime strings, returning a Date object.

```typescript
pz.DateTimeRequired(options?: DateSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.DateTimeRequired({ msg: "Created At" });

// Valid inputs - all return Date objects
schema.parse(new Date());                      // ✅ Date object
schema.parse("2023-01-01T10:30:00Z");          // ✅ Date object
schema.parse("2023-01-01T10:30:00.123Z");      // ✅ Date object
schema.parse("2023-01-01");                    // ✅ Date object (00:00:00Z)

// Invalid inputs
schema.parse("2023-01-01 10:30:00");           // ❌ Error: Must use ISO format
schema.parse("invalid-datetime");              // ❌ Error: Created At must be a valid datetime
```

#### DateTimeOptional

Creates an optional datetime schema.

```typescript
const schema = pz.DateTimeOptional({ msg: "Updated At" });

schema.parse("2023-01-01T10:30:00Z");  // ✅ Date object
schema.parse(undefined);               // ✅ undefined
```

### DateTime String Schemas

#### DateTimeStringRequired

Creates a required schema that accepts Date objects and datetime strings, returning an ISO datetime string.

```typescript
pz.DateTimeStringRequired(options?: DateSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.DateTimeStringRequired({ msg: "Timestamp" });

// Valid inputs - all return ISO datetime strings
schema.parse("2023-01-01T10:30:00Z");          // ✅ "2023-01-01T10:30:00Z"
schema.parse("2023-01-01");                    // ✅ "2023-01-01" (date only)
schema.parse(new Date("2023-01-01T10:30:00")); // ✅ "2023-01-01T10:30:00.000Z"

// Invalid inputs
schema.parse("not-a-date");            // ❌ Error: Timestamp must be a valid datetime
```

#### DateTimeStringOptional

Creates an optional schema that returns ISO datetime strings or undefined.

```typescript
const schema = pz.DateTimeStringOptional({ msg: "Last Login" });

schema.parse("2023-01-01T10:30:00Z");  // ✅ "2023-01-01T10:30:00Z"
schema.parse(undefined);               // ✅ undefined
```

### Time String Schemas

#### TimeStringRequired

Creates a required schema that accepts ISO time strings (HH:MM:SS format).

```typescript
pz.TimeStringRequired(options?: DateSchemaOptions)
```

**Examples:**

```typescript
const schema = pz.TimeStringRequired({ msg: "Start Time" });

// Valid inputs
schema.parse("10:30:00");              // ✅ "10:30:00"
schema.parse("10:30:00.123");          // ✅ "10:30:00.123" (with milliseconds)
schema.parse("00:00:00");              // ✅ "00:00:00"
schema.parse("23:59:59");              // ✅ "23:59:59"

// Invalid inputs
schema.parse("10:30");                 // ❌ Error: Start Time has invalid format
schema.parse("25:00:00");              // ❌ Error: Start Time has invalid format
schema.parse("10:70:00");              // ❌ Error: Start Time has invalid format
schema.parse("10:30 AM");              // ❌ Error: Start Time has invalid format
```

#### TimeStringOptional

Creates an optional time string schema.

```typescript
const schema = pz.TimeStringOptional({ msg: "End Time" });

schema.parse("15:45:00");              // ✅ "15:45:00"
schema.parse(undefined);               // ✅ undefined
```

### 🌍 Timezone-Aware DateTime Schemas

New in Phantom Zod 1.5+, these schemas enforce **strict timezone presence** in ISO 8601 datetime strings. They only accept datetime strings that include timezone information (UTC 'Z' or offset like ±HH:MM) and reject naive datetime strings.

#### TimezoneDateTimeRequired

Creates a required schema that accepts **only timezone-aware ISO 8601 datetime strings**.

```typescript
pz.TimezoneDateTimeRequired(options?: DateSchemaOptions)
// or using string parameter overload:
pz.TimezoneDateTimeRequired("Field Name")
```

**Examples:**

```typescript
// Using string parameter overload (recommended for simplicity)
const schema = pz.TimezoneDateTimeRequired("Event Start Time");

// ✅ Valid inputs - with timezone information
schema.parse("2023-12-25T10:30:00Z");              // UTC timezone
schema.parse("2023-12-25T10:30:00.123Z");          // UTC with milliseconds
schema.parse("2023-12-25T10:30:00+05:00");         // Positive offset
schema.parse("2023-12-25T10:30:00-08:00");         // Negative offset
schema.parse("2023-12-25T10:30:00+00:00");         // UTC equivalent offset

// ❌ Invalid inputs - missing timezone information
schema.parse("2023-12-25T10:30:00");               // ❌ Error: Event Start Time must include timezone information
schema.parse("2023-12-25 10:30:00");               // ❌ Error: Event Start Time must include timezone information
schema.parse(new Date());                           // ❌ Error: Event Start Time must include timezone information
schema.parse(undefined);                            // ❌ Error: Event Start Time is required
```

#### TimezoneDateTimeOptional

Creates an optional schema that accepts timezone-aware ISO 8601 datetime strings or undefined.

```typescript
pz.TimezoneDateTimeOptional("Field Name")
```

**Examples:**

```typescript
const schema = pz.TimezoneDateTimeOptional("Last Login");

// ✅ Valid inputs
schema.parse("2023-12-25T10:30:00Z");              // Valid timezone-aware datetime
schema.parse("2023-12-25T10:30:00+02:00");         // Valid with offset
schema.parse(undefined);                            // Valid - optional field

// ❌ Invalid inputs - missing timezone
schema.parse("2023-12-25T10:30:00");               // ❌ Error: Last Login must include timezone information
schema.parse(new Date());                           // ❌ Error: Last Login must include timezone information
```

**When to Use Timezone Schemas:**

- 🌍 **Multi-timezone applications** - Global events, appointments, logs
- 🔒 **Audit trails** - Precise timestamp tracking with timezone context
- 📊 **API contracts** - Strict datetime format standards
- ⚖️ **Compliance** - Regulatory requirements for timestamp precision
- 🤝 **Data exchange** - Integration with external timezone-aware systems

## Type Definitions

```typescript
interface DateSchemaOptions {
  msg?: string;           // Field name or custom message
  msgType?: MsgType;      // Message formatting type
  min?: Date;            // Minimum date constraint
  max?: Date;            // Maximum date constraint
}

// Inferred types
type DateRequired = Date;                    // Always a Date object
type DateOptional = Date | undefined;        // Date object or undefined
type DateStringRequired = string;            // ISO date string (YYYY-MM-DD)
type DateTimeStringRequired = string;        // ISO datetime string
type TimeStringRequired = string;            // ISO time string (HH:MM:SS)
type TimezoneDateTimeRequired = string;      // ISO datetime string with timezone
type TimezoneDateTimeOptional = string | undefined; // Optional timezone-aware datetime
```

## Format Support

### Accepted Input Formats

| Schema Type | Input Examples | Output Format |
|-------------|---------------|---------------|
| `DateRequired` | `new Date()`, `"2023-01-01"` | `Date` object |
| `DateStringRequired` | `new Date()`, `"2023-01-01"` | `"2023-01-01"` |
| `DateTimeRequired` | `new Date()`, `"2023-01-01T10:30:00Z"` | `Date` object |
| `DateTimeStringRequired` | `new Date()`, `"2023-01-01T10:30:00Z"` | ISO datetime string |
| `TimeStringRequired` | `"10:30:00"`, `"10:30:00.123"` | ISO time string |
| `TimezoneDateTimeRequired` | `"2023-01-01T10:30:00Z"`, `"2023-01-01T10:30:00+05:00"` | Timezone-aware datetime string |
| `TimezoneDateTimeOptional` | Same as above + `undefined` | Timezone-aware datetime string or `undefined` |

### ISO 8601 Format Examples

**Date Strings:**
- `"2023-01-01"` - Basic date
- `"2023-12-25"` - Valid calendar date

**DateTime Strings:**
- `"2023-01-01T10:30:00Z"` - UTC timezone
- `"2023-01-01T10:30:00.123Z"` - With milliseconds
- `"2023-01-01T10:30:00+05:00"` - With timezone offset

**Time Strings:**
- `"10:30:00"` - Hours, minutes, seconds
- `"10:30:00.123"` - With milliseconds
- `"00:00:00"` - Midnight
- `"23:59:59"` - End of day

## Common Patterns

### Event Management Schema

```typescript
import { z } from "zod";
import { pz } from "phantom-zod";

const eventSchema = z.object({
  title: pz.StringRequired({ msg: "Event Title" }),
  description: pz.StringOptional({ msg: "Description" }),
  
  // Date management
  startDate: pz.DateRequired({ 
    msg: "Start Date",
    min: new Date() // Must be in the future
  }),
  endDate: pz.DateOptional({ 
    msg: "End Date",
    min: new Date()
  }),
  
  // Time management
  startTime: pz.TimeStringRequired({ msg: "Start Time" }),
  endTime: pz.TimeStringOptional({ msg: "End Time" }),
  
  // System timestamps
  createdAt: pz.DateTimeStringRequired({ msg: "Created At" }),
  updatedAt: pz.DateTimeStringOptional({ msg: "Updated At" }),
}).refine(data => {
  // Ensure end date is after start date
  if (data.endDate && data.startDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

type Event = z.infer<typeof eventSchema>;
```

### User Profile Schema

```typescript
const userProfileSchema = z.object({
  // Personal information
  firstName: pz.StringRequired({ msg: "First Name" }),
  lastName: pz.StringRequired({ msg: "Last Name" }),
  
  // Dates
  birthDate: pz.DateRequired({
    msg: "Birth Date",
    min: new Date("1900-01-01"),
    max: new Date() // Can't be in the future
  }),
  
  // Optional dates stored as strings
  graduationDate: pz.DateStringOptional({ msg: "Graduation Date" }),
  anniversaryDate: pz.DateStringOptional({ msg: "Anniversary Date" }),
  
  // Timestamps
  joinedAt: pz.DateTimeStringRequired({ msg: "Joined Date" }),
  lastLoginAt: pz.DateTimeStringOptional({ msg: "Last Login" }),
  
  // Preferences
  preferredMeetingTime: pz.TimeStringOptional({ msg: "Preferred Meeting Time" }),
  workStartTime: pz.TimeStringOptional({ msg: "Work Start Time" }),
  workEndTime: pz.TimeStringOptional({ msg: "Work End Time" }),
});
```

### Booking System Schema

```typescript
const bookingSchema = z.object({
  // Basic info
  customerName: pz.StringRequired({ msg: "Customer Name" }),
  service: pz.StringRequired({ msg: "Service" }),
  
  // Booking date and time
  bookingDate: pz.DateStringRequired({
    msg: "Booking Date",
    min: new Date() // Future bookings only
  }),
  startTime: pz.TimeStringRequired({ msg: "Start Time" }),
  endTime: pz.TimeStringRequired({ msg: "End Time" }),
  
  // System tracking
  bookedAt: pz.DateTimeRequired({ msg: "Booked At" }),
  confirmedAt: pz.DateTimeOptional({ msg: "Confirmed At" }),
  cancelledAt: pz.DateTimeOptional({ msg: "Cancelled At" }),
  
}).refine(data => {
  // Validate time range
  const start = new Date(`1970-01-01T${data.startTime}`);
  const end = new Date(`1970-01-01T${data.endTime}`);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
});
```

### Log Entry Schema

```typescript
const logEntrySchema = z.object({
  level: pz.EnumRequired(["info", "warn", "error"], { msg: "Log Level" }),
  message: pz.StringRequired({ msg: "Message" }),
  
  // Timestamps
  timestamp: pz.DateTimeStringRequired({ msg: "Timestamp" }),
  
  // Optional dates for event correlation
  eventDate: pz.DateStringOptional({ msg: "Event Date" }),
  eventTime: pz.TimeStringOptional({ msg: "Event Time" }),
  
  // System info
  source: pz.StringRequired({ msg: "Source" }),
  userId: pz.StringOptional({ msg: "User ID" }),
});
```

### Financial Transaction Schema

```typescript
const transactionSchema = z.object({
  // Transaction details
  amount: pz.PositiveRequired({ msg: "Amount" }),
  currency: pz.StringRequired({ msg: "Currency" }),
  description: pz.StringRequired({ msg: "Description" }),
  
  // Dates
  transactionDate: pz.DateStringRequired({
    msg: "Transaction Date",
    max: new Date() // Can't be in the future
  }),
  
  // Timestamps with precise timing
  processedAt: pz.DateTimeStringRequired({ msg: "Processed At" }),
  settledAt: pz.DateTimeStringOptional({ msg: "Settled At" }),
  
  // Batch processing
  batchDate: pz.DateStringOptional({ msg: "Batch Date" }),
  batchTime: pz.TimeStringOptional({ msg: "Batch Time" }),
});
```

## Error Messages

Date schemas provide specific error messages based on validation type:

### Default Messages (English)

- **Required:** `"[Field Name] is required"`
- **Invalid Date:** `"[Field Name] must be a valid date"`
- **Invalid DateTime:** `"[Field Name] must be a valid datetime"`
- **Invalid Format:** `"[Field Name] has invalid format"`
- **Range:** `"[Field Name] is invalid"` (when outside min/max range)

### Custom Error Messages

```typescript
import { MsgType } from "phantom-zod";

const schema = pz.DateRequired({
  msg: "Please enter a valid birth date (YYYY-MM-DD format)",
  msgType: MsgType.Message,
  min: new Date("1900-01-01"),
  max: new Date()
});
```

## Best Practices

### 1. Choose Appropriate Return Types

```typescript
// Use Date objects for calculations and comparisons
const eventDate = pz.DateRequired({ msg: "Event Date" });

// Use date strings for storage and serialization
const recordDate = pz.DateStringRequired({ msg: "Record Date" });

// Use datetime strings for APIs and logging
const timestamp = pz.DateTimeStringRequired({ msg: "Timestamp" });

// Use time strings for scheduling
const meetingTime = pz.TimeStringRequired({ msg: "Meeting Time" });
```

### 2. Apply Reasonable Date Constraints

```typescript
// Good: Reasonable birth date constraints
const birthDate = pz.DateRequired({
  msg: "Birth Date",
  min: new Date("1900-01-01"),
  max: new Date() // Today
});

// Good: Future event validation
const eventDate = pz.DateRequired({
  msg: "Event Date",
  min: new Date() // Must be future
});

// Good: Historical data with reasonable limits
const historicalDate = pz.DateRequired({
  msg: "Historical Date",
  min: new Date("1800-01-01"),
  max: new Date()
});
```

### 3. Handle Time Zones Appropriately

```typescript
// For UTC storage
const utcTimestamp = pz.DateTimeStringRequired({ msg: "UTC Timestamp" });

// For local dates (no time component)
const localDate = pz.DateStringRequired({ msg: "Local Date" });

// For time-only (no date component)
const scheduleTime = pz.TimeStringRequired({ msg: "Schedule Time" });
```

### 4. Use Validation for Business Rules

```typescript
const appointmentSchema = z.object({
  date: pz.DateStringRequired({
    msg: "Appointment Date",
    min: new Date() // Future appointments only
  }),
  startTime: pz.TimeStringRequired({ msg: "Start Time" }),
  endTime: pz.TimeStringRequired({ msg: "End Time" }),
}).refine(data => {
  // Business rule: appointments must be at least 30 minutes
  const start = new Date(`1970-01-01T${data.startTime}`);
  const end = new Date(`1970-01-01T${data.endTime}`);
  const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  return diffMinutes >= 30;
}, {
  message: "Appointment must be at least 30 minutes long",
  path: ["endTime"]
});
```

## Integration Examples

### With React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  eventTitle: pz.StringRequired({ msg: "Event Title" }),
  startDate: pz.DateStringRequired({ 
    msg: "Start Date",
    min: new Date()
  }),
  startTime: pz.TimeStringRequired({ msg: "Start Time" }),
  endDate: pz.DateStringOptional({ msg: "End Date" }),
  endTime: pz.TimeStringOptional({ msg: "End Time" }),
});

const DateTimeForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema)
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input 
        {...register("eventTitle")} 
        placeholder="Event Title" 
      />
      {errors.eventTitle && <span>{errors.eventTitle.message}</span>}
      
      <input 
        {...register("startDate")} 
        type="date" 
        min={new Date().toISOString().split('T')[0]}
      />
      {errors.startDate && <span>{errors.startDate.message}</span>}
      
      <input 
        {...register("startTime")} 
        type="time" 
        step="1"
      />
      {errors.startTime && <span>{errors.startTime.message}</span>}
      
      <input 
        {...register("endDate")} 
        type="date" 
        min={new Date().toISOString().split('T')[0]}
      />
      {errors.endDate && <span>{errors.endDate.message}</span>}
      
      <input 
        {...register("endTime")} 
        type="time" 
        step="1"
      />
      {errors.endTime && <span>{errors.endTime.message}</span>}
    </form>
  );
};
```

### With Express.js API

```typescript
import express from "express";

const eventSchema = z.object({
  title: pz.StringRequired({ msg: "Title" }),
  startDate: pz.DateStringRequired({ 
    msg: "Start Date",
    min: new Date()
  }),
  startTime: pz.TimeStringRequired({ msg: "Start Time" }),
  endDate: pz.DateStringOptional({ msg: "End Date" }),
  createdAt: pz.DateTimeStringRequired({ msg: "Created At" }),
});

app.post("/events", (req, res) => {
  try {
    // Add server timestamp
    const eventData = eventSchema.parse({
      ...req.body,
      createdAt: new Date().toISOString()
    });
    
    // All date/time fields are validated and normalized
    console.log("Event data:", eventData);
    // {
    //   title: "Meeting",
    //   startDate: "2023-12-25", 
    //   startTime: "10:30:00",
    //   endDate: undefined,
    //   createdAt: "2023-01-01T12:00:00.000Z"
    // }
    
    await Event.create(eventData);
    res.json({ success: true, event: eventData });
  } catch (error) {
    res.status(400).json({ 
      error: "Validation failed",
      issues: error.issues 
    });
  }
});
```

### Database Integration

```typescript
// Database model with proper date/time types
interface EventModel {
  id: string;
  title: string;
  startDate: string;        // ISO date string
  startTime: string;        // ISO time string
  endDate?: string;         // Optional ISO date string
  createdAt: Date;          // Database timestamp
  updatedAt?: Date;         // Optional update timestamp
}

// API schema matching database structure
const eventCreateSchema = z.object({
  title: pz.StringRequired({ msg: "Title" }),
  startDate: pz.DateStringRequired({ 
    msg: "Start Date",
    min: new Date()
  }),
  startTime: pz.TimeStringRequired({ msg: "Start Time" }),
  endDate: pz.DateStringOptional({ msg: "End Date" }),
});

// Database insert with proper types
app.post("/events", async (req, res) => {
  const eventData = eventCreateSchema.parse(req.body);
  
  const event = await Event.create({
    ...eventData,
    id: generateId(),
    createdAt: new Date(), // Server Date object
  });
  
  res.json({ event });
});

// API response schema
const eventResponseSchema = z.object({
  id: pz.StringRequired({ msg: "ID" }),
  title: pz.StringRequired({ msg: "Title" }),
  startDate: pz.DateStringRequired({ msg: "Start Date" }),
  startTime: pz.TimeStringRequired({ msg: "Start Time" }),
  endDate: pz.DateStringOptional({ msg: "End Date" }),
  createdAt: pz.DateTimeStringRequired({ msg: "Created At" }),
  updatedAt: pz.DateTimeStringOptional({ msg: "Updated At" }),
});

app.get("/events/:id", async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  // Transform for API response
  const responseData = eventResponseSchema.parse({
    ...event,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt?.toISOString(),
  });
  
  res.json({ event: responseData });
});
```

## Utility Functions

### Date Helper Examples

```typescript
import { getDateExamples } from "phantom-zod";

// Get format examples for user guidance
const examples = getDateExamples();
console.log("Date format:", examples.date);         // "2023-01-01"
console.log("DateTime format:", examples.dateTime); // "2023-01-01T10:30:00Z"
console.log("Time format:", examples.time);         // "10:30:00"

// Helper functions for common operations
const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const combineDateAndTime = (date: string, time: string): string => {
  return `${date}T${time}:00.000Z`;
};

const extractDateFromDateTime = (datetime: string): string => {
  return datetime.split('T')[0];
};

// Usage in components
const EventForm = () => {
  const examples = getDateExamples();
  
  return (
    <div>
      <input 
        type="date" 
        placeholder={`Format: ${examples.date}`}
      />
      <input 
        type="time" 
        placeholder={`Format: ${examples.time}`}
      />
    </div>
  );
};
```

## See Also

- [String Schemas](string-schemas.md) - Text validation
- [Number Schemas](number-schemas.md) - Numeric validation
- [Boolean Schemas](boolean-schemas.md) - Boolean validation
- [Array Schemas](array-schemas.md) - Array validation
- [Form Validation Examples](../examples/form-validation.md) - Practical form usage
- [API Validation Examples](../examples/api-validation.md) - API endpoint validation
