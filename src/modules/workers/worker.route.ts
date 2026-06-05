import { Router } from "express";
import {
  addNewWorker,
  deleteWorker,
  fetchAllWorkers,
  updateWorker,
} from "./worker.controller.js";

const router = Router();

router.get("/add-new-worker", addNewWorker);
router.post("/update-worker-info", updateWorker);
router.delete("/delete-worker", deleteWorker);
router.get("/fetch-all-workers", fetchAllWorkers);
