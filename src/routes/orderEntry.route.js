import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  create,
  update,
  remove,
  getOrderEntryReport,
} from "../controllers/orderEntry.controller.js";
import { multerUploadForGrid } from "../utils/multerUpload.js";

router.post("/", multerUploadForGrid.array("images"), create);

router.get("/", get);

router.get("/report/all", getOrderEntryReport);

router.put("/:id", multerUploadForGrid.array("images"), update);

router.get("/:id", getOne);

router.delete("/:id", remove);

export default router;
