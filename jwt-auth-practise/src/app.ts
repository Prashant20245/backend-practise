import express from "express";
import authRoute from "./routes/auth.route";
import userRoute from "./routes/user.route";
const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/auth", authRoute);
app.use("/user", userRoute);

export default app;
