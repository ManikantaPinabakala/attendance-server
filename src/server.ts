import cors from "cors";
import express from "express";
import morgan from "morgan";
import env from "./config.js";
import routes from "./handlers/routes.js";

const app = express();
const origins = env.CORS_ALLOWED_ORIGIN.split(",").map((origin) =>
  origin.trim(),
);
app.use(
  cors({
    origin: (origin, done) => done(null, !origin || origins.includes(origin)),
    credentials: true,
  }),
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use("/api", routes);

app.listen(env.PORT, () =>
  console.info(`Attendance API listening on ${env.PORT}`),
);
