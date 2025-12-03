# Environment Configuration

This directory contains environment-specific configuration files for the Medico Store application.

## Files

- **environment.example.ts** - Template file (committed to Git)
- **environment.ts** - Development environment config (ignored by Git)
- **environment.prod.ts** - Production environment config (ignored by Git)

## Setup

1. Copy the example file to create your environment files:
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   cp src/environments/environment.example.ts src/environments/environment.prod.ts
   ```

2. Update `environment.ts` with your development values:
   - `apiBaseUrl`: Your local backend API URL (default: http://localhost:8080)
   - `recaptcha.siteKey`: Your Google reCAPTCHA v3 site key

3. Update `environment.prod.ts` with your production values:
   - `apiBaseUrl`: Your production backend API URL
   - `recaptcha.siteKey`: Your production reCAPTCHA v3 site key

## Getting reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Register a new site with reCAPTCHA v3
3. Copy the site key to your environment file
4. Configure the backend with the corresponding secret key

## Security Notes

- **NEVER** commit `environment.ts` or `environment.prod.ts` to Git
- These files are ignored via `.gitignore`
- Only commit `environment.example.ts` as a template
- Keep your reCAPTCHA keys and API URLs confidential
