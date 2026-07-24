---
trigger: always_on
---

Always adhere strictly to the project's domain-driven directory structure when creating or updating files. Never place files in arbitrary locations.

Directory Placement Rules:

    src/common/: Put all shared, cross-cutting components here, organized strictly into decorators/, filters/, guards/, interceptors/, middleware/, and pipes/.

    src/config/: Place all configuration files here. Use app.config.ts for centralized environment, DB, JWT, and cloud configurations.

    src/database/: Put DB client providers, schema migrations, and seed scripts here (e.g., migrations/, seeds/, database.service.ts).

    src/modules//: Group all domain-specific logic inside dedicated feature folders (e.g., users/, auth/).

        Place request/response objects in a local dto/ folder (e.g., create-user.dto.ts).

        Place domain entities or interfaces in a local entities/ folder (e.g., user.entity.ts).

        Place feature-specific auth strategies inside a strategies/ folder if applicable.

        Keep controllers, services, modules, and test files (*.spec.ts) inside their respective module root.

    src/app.module.ts & src/main.ts: Keep root level strictly limited to app.module.ts and main.ts.