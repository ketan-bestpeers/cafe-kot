---
trigger: always_on
---

if you are trying to add or access sensitive data in the code directly by hard coding the values, then use the env for the values and use the nest config to access the values from the envs

for example, 
1. if trying to access values of the current port of the application use the following code to access,
```
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
```

2. if trying to implement a feature that require a third party feature such as github access, then first add the sensitive data like github url, token, username, etc. to the `.env` file then use the data from the config.