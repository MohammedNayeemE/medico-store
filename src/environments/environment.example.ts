// Environment configuration template
// Copy this file to environment.ts and fill in your actual values
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000', // Your backend API URL
  recaptcha: {
    siteKey: 'YOUR_RECAPTCHA_V3_SITE_KEY', // Get from https://www.google.com/recaptcha/admin
  },
};
