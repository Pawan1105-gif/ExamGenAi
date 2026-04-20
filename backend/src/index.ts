import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
  console.log(`Swagger UI: http://localhost:${env.PORT}/api/docs`);
});
