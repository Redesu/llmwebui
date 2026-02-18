import express from "express";
import messageRoutes from "./routes/messageRoutes.ts";
import chatRoutes from "./routes/chatRoutes.ts";
import settingsProfileRoutes from "./routes/settingsProfileRoutes.ts";
import characterRoutes from "./routes/characterRoutes.ts";
import { globalErrorHandler } from "./middleware/errorHandler.ts";

const app = express();

app.use(express.json());

app.use("/api/v1/characters", characterRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/chats", messageRoutes);
app.use("/api/v1/settings-profiles", settingsProfileRoutes);

app.use(globalErrorHandler);

export default app;