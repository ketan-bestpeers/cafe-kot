---
trigger: always_on
---

Always manage application settings and sensitive data through environment variables and Nest ConfigService. Never hardcode sensitive values or credentials directly in code.

Environment & Configuration Rules:

    Never hardcode sensitive data, credentials, third-party API keys, URLs, or runtime variables (e.g., GitHub tokens, ports, secret keys) directly in code.

    Always add new variables to .env first, then map them inside src/config/app.config.ts to keep config centralized.

    Always access environment variables using Nest's ConfigService rather than calling process.env directly.

        Example (App Port):
        const configService = app.get(ConfigService);
        const port = configService.get<number>('PORT') || 3000;

        Example (Third-Party Integration): For integrations like GitHub, store sensitive fields (GITHUB_TOKEN, GITHUB_URL, GITHUB_USERNAME) in .env, register them in app.config.ts, and retrieve them via ConfigService in your service classes.