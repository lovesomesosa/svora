import { Request, Response } from "express";
import * as authService from "./auth.service.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { success } from "../../utils/api-response.js";

// ??? так как функции register и login не используют данные из запроса, можно оставить тип Request без расширения. Если в будущем потребуется доступ к данным пользователя или другим параметрам, можно будет расширить тип Request аналогично тому, как это сделано в других контроллерах.
export const register = asyncHandler<Request>(async (req, res: Response) => {
  const user = await authService.register(req.body);

  return success(res, user, "User registered", 201);
});

export const login = asyncHandler<Request>(async (req, res: Response) => {
  const result = await authService.login(req.body);

  return success(res, result, "Login successful");
});