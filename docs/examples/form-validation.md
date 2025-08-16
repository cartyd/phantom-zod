# Form Validation Examples

This guide provides comprehensive examples of using Phantom Zod schemas for real-world form validation scenarios.

## Table of Contents

- [User Registration Form](#user-registration-form)
- [Contact Form](#contact-form)
- [Profile Update Form](#profile-update-form)
- [E-commerce Checkout](#e-commerce-checkout)
- [Job Application Form](#job-application-form)
- [Survey Form](#survey-form)
- [Multi-step Form](#multi-step-form)
- [Integration Examples](#integration-examples)

## User Registration Form

A comprehensive user registration form with validation for all common fields.

```typescript
import { z } from "zod";
import { pz, MsgType } from "phantom-zod";

const userRegistrationSchema = z.object({
  // Personal Information
  firstName: pz.StringRequired({ 
    msg: "First Name", 
    minLength: 2,
    maxLength: 50 
  }),
  lastName: pz.StringRequired({ 
    msg: "Last Name", 
    minLength: 2,
    maxLength: 50 
  }),
  email: pz.EmailRequired({ msg: "Email Address" }),
  confirmEmail: pz.EmailRequired({ msg: "Confirm Email" }),
  
  // Account Credentials
  username: pz.StringRequired({ 
    msg: "Username", 
    minLength: 3,
    maxLength: 20 
  }),
  password: pz.StringRequired({ 
    msg: "Password", 
    minLength: 8 
  }),
  confirmPassword: pz.StringRequired({ msg: "Confirm Password" }),
  
  // Optional Information
  dateOfBirth: pz.DateStringOptional({ msg: "Date of Birth" }),
  phone: pz.PhoneOptional({ msg: "Phone Number" }),
  
  // Preferences
  newsletter: pz.BooleanRequired({ msg: "Newsletter Subscription" }),
  terms: pz.BooleanRequired({ 
    msg: "Terms and Conditions",
    // Custom validation for terms acceptance
  }),
  
  // Profile
  bio: pz.StringOptional({ 
    msg: "Bio", 
    maxLength: 500 
  }),
}).refine(data => data.email === data.confirmEmail, {
  message: "Email addresses must match",
  path: ["confirmEmail"]
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"]
}).refine(data => data.terms === true, {
  message: "You must accept the terms and conditions",
  path: ["terms"]
});

type UserRegistration = z.infer<typeof userRegistrationSchema>;

// Usage example
const handleRegistration = (formData: unknown) => {
  try {
    const validatedData = userRegistrationSchema.parse(formData);
    console.log("Registration data:", validatedData);
    // Process registration...
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.reduce((acc, issue) => {
        const field = issue.path.join('.');
        acc[field] = issue.message;
        return acc;
      }, {} as Record<string, string>);
      console.log("Validation errors:", fieldErrors);
    }
  }
};
```

## Contact Form

A business contact form with validation for inquiries.

```typescript
const contactFormSchema = z.object({
  // Contact Information
  name: pz.StringRequired({ 
    msg: "Full Name", 
    minLength: 2,
    maxLength: 100 
  }),
  email: pz.EmailRequired({ msg: "Email Address" }),
  phone: pz.PhoneOptional({ msg: "Phone Number" }),
  company: pz.StringOptional({ 
    msg: "Company", 
    maxLength: 100 
  }),
  
  // Inquiry Details
  subject: pz.EnumRequired([
    "general", 
    "support", 
    "sales", 
    "partnership", 
    "other"
  ], { msg: "Inquiry Subject" }),
  
  message: pz.StringRequired({ 
    msg: "Message", 
    minLength: 10,
    maxLength: 2000 
  }),
  
  // Preferences
  preferredContact: pz.EnumOptional([
    "email", 
    "phone", 
    "either"
  ], { msg: "Preferred Contact Method" }),
  
  urgency: pz.EnumOptional([
    "low", 
    "medium", 
    "high", 
    "urgent"
  ], { msg: "Urgency Level" }),
  
  // Marketing
  newsletter: pz.BooleanOptional({ msg: "Newsletter Subscription" }),
});

type ContactForm = z.infer<typeof contactFormSchema>;
```

## Profile Update Form

User profile update form with partial validation.

```typescript
const profileUpdateSchema = z.object({
  // Basic Information (all optional for updates)
  firstName: pz.StringOptional({ 
    msg: "First Name", 
    minLength: 2,
    maxLength: 50 
  }),
  lastName: pz.StringOptional({ 
    msg: "Last Name", 
    minLength: 2,
    maxLength: 50 
  }),
  displayName: pz.StringOptional({ 
    msg: "Display Name", 
    minLength: 2,
    maxLength: 30 
  }),
  
  // Contact Information
  email: pz.EmailOptional({ msg: "Email Address" }),
  phone: pz.PhoneOptional({ msg: "Phone Number" }),
  website: pz.UrlOptional({ msg: "Website" }),
  
  // Personal Information
  dateOfBirth: pz.DateStringOptional({ msg: "Date of Birth" }),
  bio: pz.StringOptional({ 
    msg: "Bio", 
    maxLength: 1000 
  }),
  location: pz.StringOptional({ 
    msg: "Location", 
    maxLength: 100 
  }),
  
  // Social Links
  socialLinks: z.object({
    twitter: pz.UrlOptional({ msg: "Twitter URL" }),
    linkedin: pz.UrlOptional({ msg: "LinkedIn URL" }),
    github: pz.UrlOptional({ msg: "GitHub URL" }),
  }).optional(),
  
  // Preferences
  isPublic: pz.BooleanOptional({ msg: "Public Profile" }),
  emailNotifications: pz.BooleanOptional({ msg: "Email Notifications" }),
  marketingEmails: pz.BooleanOptional({ msg: "Marketing Emails" }),
});

type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
```

## E-commerce Checkout

Complete checkout form with billing and shipping validation.

```typescript
const checkoutSchema = z.object({
  // Customer Information
  customer: z.object({
    email: pz.EmailRequired({ msg: "Email Address" }),
    firstName: pz.StringRequired({ msg: "First Name", maxLength: 50 }),
    lastName: pz.StringRequired({ msg: "Last Name", maxLength: 50 }),
    phone: pz.PhoneOptional({ msg: "Phone Number" }),
  }),
  
  // Billing Address
  billingAddress: z.object({
    street: pz.StringRequired({ msg: "Street Address", maxLength: 200 }),
    city: pz.StringRequired({ msg: "City", maxLength: 100 }),
    state: pz.StringRequired({ msg: "State", minLength: 2, maxLength: 50 }),
    zipCode: pz.PostalCodeRequired({ msg: "ZIP Code" }),
    country: pz.StringRequired({ msg: "Country" }),
  }),
  
  // Shipping Address (optional, defaults to billing)
  shippingAddress: z.object({
    street: pz.StringRequired({ msg: "Street Address", maxLength: 200 }),
    city: pz.StringRequired({ msg: "City", maxLength: 100 }),
    state: pz.StringRequired({ msg: "State", minLength: 2, maxLength: 50 }),
    zipCode: pz.PostalCodeRequired({ msg: "ZIP Code" }),
    country: pz.StringRequired({ msg: "Country" }),
  }).optional(),
  
  // Shipping Options
  shippingMethod: pz.EnumRequired([
    "standard", 
    "expedited", 
    "overnight", 
    "pickup"
  ], { msg: "Shipping Method" }),
  
  // Payment Information
  payment: z.object({
    method: pz.EnumRequired([
      "credit_card", 
      "paypal", 
      "apple_pay", 
      "google_pay"
    ], { msg: "Payment Method" }),
    
    // Credit card fields (conditional)
    cardNumber: pz.StringOptional({ 
      msg: "Card Number", 
      minLength: 13,
      maxLength: 19 
    }),
    expiryMonth: pz.NumberOptional({ 
      msg: "Expiry Month", 
      min: 1,
      max: 12 
    }),
    expiryYear: pz.NumberOptional({ 
      msg: "Expiry Year", 
      min: new Date().getFullYear(),
      max: new Date().getFullYear() + 20 
    }),
    cvv: pz.StringOptional({ 
      msg: "CVV", 
      minLength: 3,
      maxLength: 4 
    }),
    cardholderName: pz.StringOptional({ 
      msg: "Cardholder Name", 
      maxLength: 100 
    }),
  }),
  
  // Order Notes
  orderNotes: pz.StringOptional({ 
    msg: "Order Notes", 
    maxLength: 500 
  }),
  
  // Agreements
  terms: pz.BooleanRequired({ msg: "Terms and Conditions" }),
  subscribe: pz.BooleanOptional({ msg: "Newsletter Subscription" }),
}).refine(data => {
  // Conditional validation for credit card
  if (data.payment.method === 'credit_card') {
    return data.payment.cardNumber && 
           data.payment.expiryMonth && 
           data.payment.expiryYear && 
           data.payment.cvv;
  }
  return true;
}, {
  message: "Credit card information is required",
  path: ["payment"]
}).refine(data => data.terms === true, {
  message: "You must accept the terms and conditions",
  path: ["terms"]
});

type CheckoutForm = z.infer<typeof checkoutSchema>;
```

## Job Application Form

Professional job application with file uploads and detailed validation.

```typescript
const jobApplicationSchema = z.object({
  // Personal Information
  personalInfo: z.object({
    firstName: pz.StringRequired({ msg: "First Name", maxLength: 50 }),
    lastName: pz.StringRequired({ msg: "Last Name", maxLength: 50 }),
    email: pz.EmailRequired({ msg: "Email Address" }),
    phone: pz.PhoneRequired({ msg: "Phone Number" }),
    dateOfBirth: pz.DateStringOptional({ msg: "Date of Birth" }),
    nationality: pz.StringOptional({ msg: "Nationality", maxLength: 50 }),
  }),
  
  // Address
  address: z.object({
    street: pz.StringRequired({ msg: "Street Address", maxLength: 200 }),
    city: pz.StringRequired({ msg: "City", maxLength: 100 }),
    state: pz.StringRequired({ msg: "State/Province", maxLength: 50 }),
    zipCode: pz.StringRequired({ msg: "ZIP/Postal Code", maxLength: 20 }),
    country: pz.StringRequired({ msg: "Country", maxLength: 50 }),
  }),
  
  // Professional Information
  experience: z.object({
    yearsOfExperience: pz.NumberRequired({ 
      msg: "Years of Experience", 
      min: 0,
      max: 50 
    }),
    currentPosition: pz.StringOptional({ 
      msg: "Current Position", 
      maxLength: 100 
    }),
    currentCompany: pz.StringOptional({ 
      msg: "Current Company", 
      maxLength: 100 
    }),
    expectedSalary: pz.NumberOptional({ 
      msg: "Expected Salary", 
      min: 0 
    }),
    availableStartDate: pz.DateStringRequired({ msg: "Available Start Date" }),
  }),
  
  // Education
  education: z.array(z.object({
    institution: pz.StringRequired({ msg: "Institution", maxLength: 200 }),
    degree: pz.StringRequired({ msg: "Degree", maxLength: 100 }),
    fieldOfStudy: pz.StringRequired({ msg: "Field of Study", maxLength: 100 }),
    graduationYear: pz.NumberRequired({ 
      msg: "Graduation Year",
      min: 1950,
      max: new Date().getFullYear() + 10
    }),
    gpa: pz.NumberOptional({ msg: "GPA", min: 0, max: 4.0 }),
  })).min(1, "At least one education entry is required"),
  
  // Skills
  skills: pz.StringArrayRequired({ 
    msg: "Skills", 
    minItems: 1,
    maxItems: 20 
  }),
  
  // Languages
  languages: z.array(z.object({
    language: pz.StringRequired({ msg: "Language", maxLength: 50 }),
    proficiency: pz.EnumRequired([
      "beginner", 
      "intermediate", 
      "advanced", 
      "native"
    ], { msg: "Proficiency Level" }),
  })).optional(),
  
  // Documents
  documents: z.object({
    resume: pz.FileUploadRequired({ 
      msg: "Resume",
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['.pdf', '.doc', '.docx']
    }),
    coverLetter: pz.FileUploadOptional({ 
      msg: "Cover Letter",
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['.pdf', '.doc', '.docx']
    }),
    portfolio: pz.UrlOptional({ msg: "Portfolio URL" }),
  }),
  
  // Additional Information
  additionalInfo: z.object({
    howDidYouHear: pz.EnumRequired([
      "job_board", 
      "company_website", 
      "referral", 
      "social_media", 
      "recruiter", 
      "other"
    ], { msg: "How did you hear about us?" }),
    
    referrerName: pz.StringOptional({ 
      msg: "Referrer Name", 
      maxLength: 100 
    }),
    
    whyInterested: pz.StringRequired({ 
      msg: "Why are you interested in this position?",
      minLength: 50,
      maxLength: 1000
    }),
    
    additionalComments: pz.StringOptional({ 
      msg: "Additional Comments",
      maxLength: 2000
    }),
  }),
  
  // Consent
  consent: z.object({
    dataProcessing: pz.BooleanRequired({ msg: "Data Processing Consent" }),
    backgroundCheck: pz.BooleanRequired({ msg: "Background Check Consent" }),
    newsletter: pz.BooleanOptional({ msg: "Newsletter Subscription" }),
  }),
});

type JobApplication = z.infer<typeof jobApplicationSchema>;
```

## Survey Form

Dynamic survey form with conditional fields.

```typescript
const surveySchema = z.object({
  // Respondent Information
  respondent: z.object({
    age: pz.NumberRequired({ msg: "Age", min: 16, max: 120 }),
    gender: pz.EnumOptional([
      "male", 
      "female", 
      "non-binary", 
      "prefer-not-to-say"
    ], { msg: "Gender" }),
    occupation: pz.StringOptional({ msg: "Occupation", maxLength: 100 }),
    education: pz.EnumOptional([
      "high-school", 
      "associate", 
      "bachelor", 
      "master", 
      "doctorate"
    ], { msg: "Education Level" }),
  }),
  
  // Product Usage
  productUsage: z.object({
    currentUser: pz.BooleanRequired({ msg: "Are you a current user?" }),
    usageFrequency: pz.EnumOptional([
      "daily", 
      "weekly", 
      "monthly", 
      "rarely", 
      "never"
    ], { msg: "Usage Frequency" }),
    primaryUseCase: pz.StringOptional({ 
      msg: "Primary Use Case",
      maxLength: 500
    }),
  }),
  
  // Satisfaction Ratings (1-5 scale)
  satisfaction: z.object({
    overallSatisfaction: pz.NumberRequired({ 
      msg: "Overall Satisfaction",
      min: 1,
      max: 5
    }),
    easeOfUse: pz.NumberRequired({ 
      msg: "Ease of Use",
      min: 1,
      max: 5
    }),
    valueForMoney: pz.NumberRequired({ 
      msg: "Value for Money",
      min: 1,
      max: 5
    }),
    customerSupport: pz.NumberOptional({ 
      msg: "Customer Support",
      min: 1,
      max: 5
    }),
  }),
  
  // Open-ended Questions
  feedback: z.object({
    likes: pz.StringOptional({ 
      msg: "What do you like most?",
      maxLength: 1000
    }),
    improvements: pz.StringOptional({ 
      msg: "What could be improved?",
      maxLength: 1000
    }),
    recommendations: pz.StringOptional({ 
      msg: "Would you recommend to others?",
      maxLength: 500
    }),
    additionalComments: pz.StringOptional({ 
      msg: "Additional Comments",
      maxLength: 2000
    }),
  }),
  
  // Contact for Follow-up
  followUp: z.object({
    allowContact: pz.BooleanRequired({ msg: "Allow Follow-up Contact" }),
    email: pz.EmailOptional({ msg: "Email Address" }),
    bestTimeToContact: pz.EnumOptional([
      "morning", 
      "afternoon", 
      "evening", 
      "anytime"
    ], { msg: "Best Time to Contact" }),
  }),
}).refine(data => {
  // If allowing contact, email is required
  if (data.followUp.allowContact && !data.followUp.email) {
    return false;
  }
  return true;
}, {
  message: "Email is required if you allow follow-up contact",
  path: ["followUp", "email"]
});

type SurveyResponse = z.infer<typeof surveySchema>;
```

## Multi-step Form

Multi-step wizard form with step-specific validation.

```typescript
// Step 1: Account Setup
const step1Schema = z.object({
  email: pz.EmailRequired({ msg: "Email Address" }),
  password: pz.StringRequired({ msg: "Password", minLength: 8 }),
  confirmPassword: pz.StringRequired({ msg: "Confirm Password" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"]
});

// Step 2: Personal Information
const step2Schema = z.object({
  firstName: pz.StringRequired({ msg: "First Name", maxLength: 50 }),
  lastName: pz.StringRequired({ msg: "Last Name", maxLength: 50 }),
  dateOfBirth: pz.DateStringRequired({ msg: "Date of Birth" }),
  phone: pz.PhoneRequired({ msg: "Phone Number" }),
});

// Step 3: Address Information
const step3Schema = z.object({
  address: z.object({
    street: pz.StringRequired({ msg: "Street Address", maxLength: 200 }),
    city: pz.StringRequired({ msg: "City", maxLength: 100 }),
    state: pz.StringRequired({ msg: "State", maxLength: 50 }),
    zipCode: pz.PostalCodeRequired({ msg: "ZIP Code" }),
    country: pz.StringRequired({ msg: "Country" }),
  }),
});

// Step 4: Preferences
const step4Schema = z.object({
  preferences: z.object({
    newsletter: pz.BooleanRequired({ msg: "Newsletter" }),
    notifications: pz.BooleanRequired({ msg: "Notifications" }),
    theme: pz.EnumRequired(["light", "dark", "auto"], { msg: "Theme" }),
  }),
  terms: pz.BooleanRequired({ msg: "Terms and Conditions" }),
}).refine(data => data.terms === true, {
  message: "You must accept the terms and conditions",
  path: ["terms"]
});

// Complete form schema (for final validation)
const multiStepFormSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema);

type MultiStepForm = z.infer<typeof multiStepFormSchema>;

// Usage in a wizard component
const useMultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<MultiStepForm>>({});
  
  const validateStep = (step: number, data: unknown) => {
    const schemas = [step1Schema, step2Schema, step3Schema, step4Schema];
    return schemas[step - 1].safeParse(data);
  };
  
  const submitStep = (stepData: unknown) => {
    const result = validateStep(currentStep, stepData);
    if (result.success) {
      setFormData(prev => ({ ...prev, ...result.data }));
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Final submission
        const finalResult = multiStepFormSchema.safeParse({
          ...formData,
          ...result.data
        });
        if (finalResult.success) {
          console.log("Form submitted successfully:", finalResult.data);
        }
      }
    } else {
      console.log("Validation errors:", result.error.issues);
    }
  };
  
  return { currentStep, submitStep, formData };
};
```

## Integration Examples

### With React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const RegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<UserRegistration>({
    resolver: zodResolver(userRegistrationSchema),
    mode: "onBlur" // Validate on blur for better UX
  });

  const onSubmit = async (data: UserRegistration) => {
    try {
      // Submit to API
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        console.log("Registration successful");
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          {...register("firstName")}
          placeholder="First Name"
          aria-invalid={errors.firstName ? "true" : "false"}
        />
        {errors.firstName && (
          <span role="alert">{errors.firstName.message}</span>
        )}
      </div>

      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="Email Address"
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && (
          <span role="alert">{errors.email.message}</span>
        )}
      </div>

      {/* Add other fields... */}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Registering..." : "Register"}
      </button>
    </form>
  );
};
```

### With Formik

```typescript
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";

const ContactFormWithFormik = () => {
  return (
    <Formik
      initialValues={{
        name: "",
        email: "",
        subject: "",
        message: "",
        newsletter: false
      }}
      validationSchema={toFormikValidationSchema(contactFormSchema)}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          console.log("Submitting:", values);
          // Submit logic
        } catch (error) {
          console.error("Submit error:", error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <div>
            <Field name="name" placeholder="Full Name" />
            <ErrorMessage name="name" component="div" />
          </div>

          <div>
            <Field name="email" type="email" placeholder="Email" />
            <ErrorMessage name="email" component="div" />
          </div>

          <div>
            <Field as="select" name="subject">
              <option value="">Select Subject</option>
              <option value="general">General</option>
              <option value="support">Support</option>
              <option value="sales">Sales</option>
            </Field>
            <ErrorMessage name="subject" component="div" />
          </div>

          <div>
            <Field as="textarea" name="message" placeholder="Message" />
            <ErrorMessage name="message" component="div" />
          </div>

          <div>
            <label>
              <Field type="checkbox" name="newsletter" />
              Subscribe to newsletter
            </label>
          </div>

          <button type="submit" disabled={isSubmitting}>
            Send Message
          </button>
        </Form>
      )}
    </Formik>
  );
};
```

## Best Practices

1. **Use Descriptive Field Names**: Make error messages clear and helpful
2. **Set Appropriate Constraints**: Balance user experience with data validation
3. **Provide Real-time Validation**: Validate on blur or change for better UX
4. **Handle Loading States**: Show loading indicators during submission
5. **Accessible Error Messages**: Use `aria-invalid` and `role="alert"`
6. **Progressive Enhancement**: Start with basic HTML validation, enhance with JavaScript
7. **Test Edge Cases**: Test with various input combinations and edge cases

## See Also

- [API Validation Examples](api-validation.md) - Server-side validation
- [Complex Objects](complex-objects.md) - Advanced schema patterns
- [String Schemas](../schemas/string-schemas.md) - String validation details
- [Email Schemas](../schemas/email-schemas.md) - Email validation options
