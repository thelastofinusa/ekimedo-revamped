# Ekimedo Atelier

**Where luxury meets timeless designs**

Custom Bridal dresses, Robes, and Evening Gowns for your special occasions!

## Overview

Ekimedo Atelier is a premium ecommerce platform specializing in bespoke fashion items. The website offers customers the ability to browse collections, customize orders, schedule consultations, and purchase high-end fashion items online.

## Technology Stack

### Frontend Framework

- **Next.js 16** - React-based framework for production-ready applications with App Router
- **React 19** - Latest version of the popular JavaScript library for building user interfaces
- **TypeScript** - Strongly typed programming language that builds on JavaScript

### Styling & UI

- **Tailwind CSS v4** - Utility-first CSS framework for rapid UI development
- **Shadcn/ui** - Reusable component library built with Radix UI and Tailwind CSS
- **Radix UI** - Unstyled, accessible UI components
- **Lucide React** - Beautiful & consistent icon toolkit
- **Framer Motion** - Production-ready motion library for React

### Backend & Services

- **Sanity CMS** - Headless CMS for managing content, products, and site data
- **Stripe** - Payment processing for credit card transactions
- **PayPal** - Alternative payment processing option
- **Clerk** - Authentication and user management
- **Resend** - Email delivery service for transactional emails

### Development & Tooling

- **PNPM** - Fast, disk space efficient package manager
- **ESLint** - Code quality and linting
- **Prettier** - Code formatting
- **Vercel** - Deployment platform (inferred from Next.js configuration)

### Key Features

- Custom product browsing and filtering
- Shopping cart functionality with Zustand state management
- Secure checkout with multiple payment options
- Customer consultation scheduling
- Testimonial submission system
- Order management and tracking
- Responsive design for all device sizes
- Dark mode support

## Architecture Highlights

The application follows modern React best practices with a component-driven architecture. Key architectural decisions include:

- **Server Components** - Leveraging Next.js 16's RSC for optimal performance
- **Typed Routes** - Using Next.js typed routes for type-safe navigation
- **Environment Variables** - Secure configuration management with @t3-oss/env-nextjs
- **Zod Validation** - Form validation and data parsing
- **React Hook Form** - Performant, flexible forms with easy validation
- **Zustand** - Lightweight state management for the shopping cart

## Environment Variables

The application requires several environment variables to be set.

```bash
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Clerk
CLERK_SECRET_KEY="clerk_secret_key"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="clerk_publishable_key"
CLERK_WEBHOOK_SIGNING_SECRET="clerk_webhook_signing_key"

# SANITY
SANITY_WEBHOOK_SECRET="random_webhook_secret"
SANITY_API_WRITE_TOKEN="sanity_api_write_token"
NEXT_PUBLIC_SANITY_DATASET="sanity_dataset" # production or development
NEXT_PUBLIC_SANITY_PROJECT_ID="sanity_project_id"
NEXT_PUBLIC_SANITY_API_VERSION="sanity_api_version" # 2026-01-16

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="stripe_publishable_key"
STRIPE_SECRET_KEY="stripe_secret_key"
# stripe listen --forward-to localhost:3000/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET="stripe_webhook_secret" # run the command above for development

# Paypal
PAYPAL_CLIENT_ID="paypal_client_id"
PAYPAL_CLIENT_SECRET="paypal_client_secret"

# Resend
RESEND_API_KEY="resend_api_key"
NEXT_PUBLIC_RESEND_CONTACT_EMAIL="resend_loggedin_email"
NEXT_PUBLIC_RESEND_INFO_EMAIL="resend_custom_email"

```

## Deployment

The application is designed for deployment on Vercel, taking advantage of Next.js's seamless integration with the platform.
