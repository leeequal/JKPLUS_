<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/11e81494-b49f-4c21-b7d9-e5db116a2b02

## 🔒 Security Notice

**IMPORTANT:** This application handles sensitive personal information. Please review `docs/SECURITY.md` for critical security guidelines before deployment.

### Key Security Points:
- ⚠️ **NEVER** commit `.env` or `.env.local` files
- ⚠️ **NEVER** hardcode API keys in source code
- ⚠️ **DO NOT** store PII (SSN, bank accounts) in localStorage
- ✅ Use `.env.example` as a template for configuration
- ✅ Store sensitive data on the server-side only

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit .env.local and add your values
   # IMPORTANT: .env.local is in .gitignore - NEVER commit it
   ```

3. Set the `VITE_GEMINI_API_KEY` in `.env.local` to your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
   
   **⚠️ SECURITY WARNING:**
   - This key should NOT be exposed to the client
   - For production, use a backend server to handle API calls
   - See `docs/SECURITY.md` for more details

4. Run the app:
   ```bash
   npm run dev
   ```

## 📋 Project Structure

```
├── Router.tsx                 # Main entry point (3 apps selector)
├── apps/
│   ├── user-app/             # Worker/Employee application
│   ├── employer-app/         # Employer/Site Manager application
│   └── admin-app/            # Admin management system
├── docs/
│   └── SECURITY.md           # Security guidelines & best practices
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore patterns (includes .env)
└── package.json              # Dependencies
```

## 🚀 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📝 Environment Variables

See `.env.example` for all available configuration options.

**Key variables:**
- `VITE_GEMINI_API_KEY`: Google Gemini API key (⚠️ for development only)
- `VITE_API_BASE_URL`: Backend API endpoint (future use)
- `VITE_APP_ENV`: Application environment (development/production)

## 🔐 Security Best Practices

1. **Never commit sensitive files:**
   ```bash
   # These files are in .gitignore and should NEVER be committed:
   .env
   .env.local
   .env.*.local
   ```

2. **Use environment variables:**
   ```javascript
   // ✅ Good
   const apiKey = process.env.VITE_GEMINI_API_KEY;
   
   // ❌ Bad
   const apiKey = 'sk-...';
   ```

3. **Protect sensitive data:**
   - Store PII on the server only
   - Use HTTPS for all communications
   - Implement authentication properly
   - See `docs/SECURITY.md` for full guidelines

## 📚 Documentation

- **Security:** See `docs/SECURITY.md` for comprehensive security guidelines
- **Development:** See individual app directories for specific documentation
- **Deployment:** Refer to deployment guides for your hosting platform

## 🤝 Contributing

When contributing, please:
1. Review `docs/SECURITY.md` for security requirements
2. Never commit sensitive data or API keys
3. Use `.env.example` for configuration templates
4. Add security comments for sensitive code sections

## 📄 License

© 2024 Construction Workforce Matching Platform. All rights reserved.
