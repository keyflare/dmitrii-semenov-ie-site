import { isRouteErrorResponse } from "react-router";

export function getRootErrorKind(error: unknown): "not-found" | "error" {
  if (error instanceof Response) {
    return error.status === 404 ? "not-found" : "error";
  }

  return isRouteErrorResponse(error) && error.status === 404 ? "not-found" : "error";
}
