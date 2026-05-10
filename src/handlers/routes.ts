import { Request, Response, Router } from "express";

export type RouteHandler = (req: Request, res: Response) => void;
export const defineRoute = (handler: RouteHandler) => handler;

export const router = Router();

router.get(
  "/health",
  defineRoute((req, res) => {
    res.json({ status: "OK" });
  }),
);
