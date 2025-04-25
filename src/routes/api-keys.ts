import { Hono } from "hono";
import {
  createApiKeyHandler,
  deleteApiKeyHandler,
  getApiKeyHandler,
  listApiKeysHandler,
  updateApiKeyHandler,
} from "../controllers/api-key-controller.ts";
import { authenticate, authorize } from "../middlewares/auth.ts";

// Create router
const router = new Hono();

// All routes require authentication and admin authorization
router.use("*", authenticate);
router.use("*", authorize(["admin"]));

// API key routes
router.get("/", listApiKeysHandler);
router.post("/", createApiKeyHandler);
router.get("/:id", getApiKeyHandler);
router.put("/:id", updateApiKeyHandler);
router.delete("/:id", deleteApiKeyHandler);

export default router;
