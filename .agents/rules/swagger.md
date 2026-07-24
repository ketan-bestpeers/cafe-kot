---
trigger: always_on
---

Always enforce Swagger documentation on all new and updated NestJS APIs.

Controller Requirements:

    Add @ApiTags('Feature Name') to the controller class.

    Add @ApiBearerAuth() if the route requires authentication.

Route/Endpoint Requirements:

    Add @ApiOperation({ summary: '...', description: '...' }) to every handler.

    Add success responses like @ApiOkResponse({ type: ReturnDto }) or @ApiCreatedResponse({ type: ReturnDto }).

    Add expected error responses like @ApiBadRequestResponse(), @ApiUnauthorizedResponse(), or @ApiNotFoundResponse().

    Add @ApiParam() and @ApiQuery() where applicable.

DTO Requirements:

    Add @ApiProperty() to all required fields with example and description.

    Add @ApiPropertyOptional() to all optional fields.

    Set enum and array types explicitly (e.g., enum: MyEnum, isArray: true).