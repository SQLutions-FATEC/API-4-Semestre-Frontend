import { createServer } from "miragejs";
import addressRoutes from "./routes/AddressRoutes";
import radarRoutes from "./routes/RadarRoutes";
import registerRoutes from "./routes/RegisterRoutes";
import userRoutes from "./routes/UserRoutes";
import type { MockRouteParams } from "./types";

type SimpleServer = any;

declare global {
  interface Window {
    server?: SimpleServer;
  }
}

export function makeServer() {
  if (import.meta.env.MODE === "development" && !window.server) {
    const routes: MockRouteParams[] = [
      ...addressRoutes,
      ...radarRoutes,
      ...registerRoutes,
      ...userRoutes,
    ];

    window.server = createServer({
      routes(this: SimpleServer) {
        this.urlPrefix = import.meta.env.VITE_API_URL;
        this.namespace = "/api";
        this.timing = 400;

        routes.forEach((route) => {
          (this as any)[route.method](route.url, (_: unknown, request: any) => {
            return route.result({
              params: request.params || {},
              queryParams: request.queryParams || {},
              requestBody: request.requestBody || "",
            });
          });
        });

        this.passthrough();
      },
    });

    return window.server;
  }

  return undefined;
}
