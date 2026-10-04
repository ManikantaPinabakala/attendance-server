import { Router } from "express";
import { adminLogin } from "./admin.controller.js";

const router = Router()

router.post('/login', adminLogin)