import { Response } from "miragejs";
import type { APIFailureWrapperParams, MockRouteParams } from "./types";

export function APIFailureWrapper<T>({
  content,
  errorMessage = "Generic error",
  specificError,
  failureRate = 0,
}: APIFailureWrapperParams<T>): T | Response {
  const chance = Math.floor(Math.random() * 100);

  if (failureRate > chance) {
    if (specificError && Object.keys(specificError).length > 0) {
      return new Response(
        specificError.status,
        { "Content-Type": "application/json" },
        {
          code: specificError.status,
          key: specificError.message,
          context: {
            message: specificError.message,
            additionalInfo: "Additional context details",
          },
        }
      );
    } else {
      return new Response(
        400,
        { "Content-Type": "application/json" },
        {
          code: 400,
          key: errorMessage,
          context: {
            message: errorMessage,
            additionalInfo: "Additional context details",
          },
        }
      );
    }
  }

  return content;
}

export function mockFlag(params: MockRouteParams, state: "on" | "off" = "on"): MockRouteParams {
  if (state === "on") {
    return params;
  }
  return {
    method: params.method,
    url: "",
    result: params.result,
  };
}
