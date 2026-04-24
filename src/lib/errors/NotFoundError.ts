import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(resource: string, identifier: string) {
    super({
      code: "NOT_FOUND",
      message: `${resource} no encontrado: ${identifier}`,
      statusCode: 404,
      context: { resource, identifier },
    });
    this.name = "NotFoundError";
  }
}
