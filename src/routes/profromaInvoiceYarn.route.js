import { Router } from "express";
const router = Router();
import {
  get,
  getPIList,
  getOne,
  create,
  update,
  remove,
} from "../controllers/proformaInvoiceYarn.controller.js";
import { multerUploadForGrid } from "../utils/multerUpload.js";

router.post("/", multerUploadForGrid.array("images"), create);

router.get("/", get);
router.get("/proFormaList", getPIList);

router.put("/:id", multerUploadForGrid.array("images"), update);

router.get("/:id", getOne);
router.delete("/:id", remove);

export default router;
