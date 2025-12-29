'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

// Form field wrapper for easy form creation
interface FormFieldWrapperProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormFieldWrapper({
  name,
  label,
  description,
  required,
  children,
}: FormFieldWrapperProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>{children}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Enhanced form component with validation
interface EnhancedFormProps<T extends z.ZodSchema> {
  schema: T;
  defaultValues: z.infer<T>;
  onSubmit: (values: z.infer<T>) => Promise<void> | void;
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  children: (form: ReturnType<typeof useForm<z.infer<T>>>) => React.ReactNode;
  className?: string;
}

export function EnhancedForm<T extends z.ZodSchema>({
  schema,
  defaultValues,
  onSubmit,
  title,
  description,
  submitText = 'Submit',
  cancelText,
  onCancel,
  isLoading = false,
  children,
  className,
}: EnhancedFormProps<T>) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = async (values: z.infer<T>) => {
    try {
      await onSubmit(values);
      toast.success('Form submitted successfully');
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {children(form)}
            <div className="flex justify-end space-x-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  {cancelText || 'Cancel'}
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : submitText}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Pre-built form field components
export const FormFields = {
  // Text input field
  text: (props: {
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'tel' | 'url';
    disabled?: boolean;
  }) => (
    <Input
      {...props}
      onChange={(e) => e.target.value}
    />
  ),

  // Textarea field
  textarea: (props: {
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
  }) => <Textarea {...props} />,

  // Select field
  select: (props: {
    placeholder?: string;
    options: { value: string; label: string }[];
    disabled?: boolean;
  }) => (
    <Select onValueChange={(value) => value}>
      <SelectTrigger>
        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>
      <SelectContent>
        {props.options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),

  // Checkbox field
  checkbox: (props: {
    label?: string;
    description?: string;
    disabled?: boolean;
  }) => (
    <div className="flex items-center space-x-2">
      <Checkbox id="checkbox" disabled={props.disabled} />
      <div className="grid gap-1.5 leading-none">
        {props.label && (
          <label
            htmlFor="checkbox"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {props.label}
          </label>
        )}
        {props.description && (
          <p className="text-sm text-muted-foreground">{props.description}</p>
        )}
      </div>
    </div>
  ),

  // Radio group field
  radioGroup: (props: {
    options: { value: string; label: string }[];
    disabled?: boolean;
  }) => (
    <RadioGroup disabled={props.disabled}>
      {props.options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupItem value={option.value} id={option.value} />
          <label htmlFor={option.value} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {option.label}
          </label>
        </div>
      ))}
    </RadioGroup>
  ),

  // Switch field
  switch: (props: {
    label?: string;
    description?: string;
    disabled?: boolean;
  }) => (
    <div className="flex items-center space-x-2">
      <Switch id="switch" disabled={props.disabled} />
      <div className="grid gap-1.5 leading-none">
        {props.label && (
          <label
            htmlFor="switch"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {props.label}
          </label>
        )}
        {props.description && (
          <p className="text-sm text-muted-foreground">{props.description}</p>
        )}
      </div>
    </div>
  ),
};

// Form validation schemas
export const formSchemas = {
  // Login form schema
  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    remember: z.boolean().optional(),
  }),

  // Exam form schema
  exam: z.object({
    name: z.string().min(1, 'Exam name is required'),
    date: z.string().min(1, 'Date is required'),
    location: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['draft', 'published', 'completed']),
    type: z.enum(['mock', 'final', 'midterm', 'quiz']),
  }),

  // School form schema
  school: z.object({
    name: z.string().min(1, 'School name is required'),
    code: z.string().min(1, 'School code is required'),
    address: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    principal: z.string().optional(),
  }),

  // Student form schema
  student: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    schoolId: z.string().min(1, 'School is required'),
    class: z.string().optional(),
    rollNumber: z.string().optional(),
  }),
};

// Example usage component
export function ExampleLoginForm() {
  return (
    <EnhancedForm
      schema={formSchemas.login}
      defaultValues={{
        email: '',
        password: '',
        remember: false,
      }}
      onSubmit={async (values) => {
        console.log('Login values:', values);
        // Handle login logic here
      }}
      title="Sign In"
      description="Enter your credentials to access your account"
      submitText="Sign In"
    >
      {(form) => (
        <>
          <FormFieldWrapper
            name="email"
            label="Email"
            required
          >
            <FormFields.text
              type="email"
              placeholder="Enter your email"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            name="password"
            label="Password"
            required
          >
            <FormFields.text
              type="password"
              placeholder="Enter your password"
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            name="remember"
            description="Remember me for 30 days"
          >
            <FormFields.checkbox label="Remember me" />
          </FormFieldWrapper>
        </>
      )}
    </EnhancedForm>
  );
}
