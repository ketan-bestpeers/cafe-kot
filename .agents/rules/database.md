---
trigger: always_on
---

Always use NestJS TypeORM (or Prisma/MikroORM depending on your setup) for database access. Never use raw SQL queries or direct client connections.

Module & Service Requirements:

    Register entities/schemas in the module using TypeORMModule.forFeature([EntityName]).

    Inject repositories into services using @InjectRepository(EntityName) inside constructor.

Query & Operation Rules:

    Use repository methods (findOne, find, save, create, update, delete) or QueryBuilder for all DB interactions.

    Keep all database access logic inside dedicated services/repositories—never execute database queries directly inside controllers.

Transaction Rule:

    Any service function that performs more than one database operation (e.g., multiple writes, creates, updates, or deletes) MUST be wrapped inside a database transaction (e.g., DataSource.transaction / QueryRunner) to guarantee data integrity and automatic rollback on failure.

Entity & DTO Mapping Rules:

    Always map database entities to response DTOs or clean interfaces before returning them from services. Never leak raw database entities to the controller response.

    Enforce relational constraints, indexes, and soft deletes (@DeleteDateColumn) directly within entity definitions.