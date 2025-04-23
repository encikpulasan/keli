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

// Public routes - Anyone can view products
router.get("/", listProductsHandler);
router.get("/:id", getProductHandler);

// Protected routes - Only admin can manage products
router.post("/", authenticate, authorize(["admin"]), createProductHandler);
router.put("/:id", authenticate, authorize(["admin"]), updateProductHandler);
router.delete("/:id", authenticate, authorize(["admin"]), deleteProductHandler);

export default router;
