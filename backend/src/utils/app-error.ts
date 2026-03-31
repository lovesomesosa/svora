export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Errors:  400 — плохой запрос, неверные данные
//          401 — не авторизован
//          403 — нет прав
//          404 — объект не найден
//          409 — конфликт, например занятая почта или duplicate