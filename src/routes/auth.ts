import { Hono } from "hono";
import {
  getCurrentUserHandler,
  loginHandler,
  refreshTokenHandler,
  registerAdminHandler,
  registerHandler,
} from "../controllers/auth-controller.ts";
import { authenticate } from "../middlewares/auth.ts";

// Create router
const router = new Hono();

// Public routes
router.post("/register", registerHandler);
router.post("/register/admin", registerAdminHandler);
router.post("/login", loginHandler);

// Protected routes
router.use("/me", authenticate);
router.get("/me", getCurrentUserHandler);
router.post("/refresh-token", authenticate, refreshTokenHandler);

export default router;
