import { Hono } from "hono";
import {
  createProductHandler,
  deleteProductHandler,
  getProductHandler,
  listProductsHandler,
  updateProductHandler,
} from "../controllers/product-controller.ts";
import { authenticate, authorize } from "../middlewares/auth.ts";

// Create router
const router = new Hono();

// Public routes
router.get("/", listProductsHandler);
router.get("/:id", getProductHandler);

// Protected routes - admin only
router.post("/", authenticate, createProductHandler);
router.put("/:id", authenticate, updateProductHandler);
router.delete("/:id", authenticate, deleteProductHandler);

export default router;
