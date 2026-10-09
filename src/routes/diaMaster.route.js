import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
} from "../controllers/diaMaster.contoller.js";

router.get("/", get);
router.get("/:id", getOne);
router.get("/search/:searchKey", getSearch);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
