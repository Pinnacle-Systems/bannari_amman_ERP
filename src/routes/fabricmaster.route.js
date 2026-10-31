import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  getSearch,
  search,
  create,
  update,
  remove,
} from "../controllers/fabircMaster.controller.js";

router.get("/", get);
router.get("/search", search);
router.get("/:id", getOne);
router.get("/search/:searchKey", getSearch);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
