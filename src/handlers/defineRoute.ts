import { NextFunction, Request, RequestHandler, Response } from "express";

export type RouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown> | unknown;

/**
 * Wraps async controllers so they use the common error pipeline.
 */
export const defineRoute =
  (handler: RouteHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
