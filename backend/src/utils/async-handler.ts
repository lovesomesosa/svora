import { NextFunction, Request, Response } from "express";

type AsyncRouteHandler<TRequest extends Request = Request> = (
  req: TRequest,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler = <TRequest extends Request = Request>(
  handler: AsyncRouteHandler<TRequest>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req as TRequest, res, next)).catch(next);
  };
};
