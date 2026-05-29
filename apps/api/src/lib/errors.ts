export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function assertFound<T>(value: T | null | undefined, message = "Not found"): T {
  if (value == null) throw new AppError(404, message, "NOT_FOUND");
  return value;
}

export function assertCondition(ok: boolean, status: number, message: string, code?: string) {
  if (!ok) throw new AppError(status, message, code);
}
