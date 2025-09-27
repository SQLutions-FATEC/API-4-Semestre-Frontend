import { createServer } from "miragejs";
import addressRoutes from "./routes/AddressRoutes";
import radarRoutes from "./routes/RadarRoutes";
import registerRoutes from "./routes/RegisterRoutes";
import userRoutes from "./routes/UserRoutes";
import type { MockRouteParams } from "./types";

export function makeServer() {
  if (import.meta.env.MODE === "development" && !window.server) {
    const routes: MockRouteParams[] = [
      ...addressRoutes,
      ...radarRoutes,
      ...registerRoutes,
      ...userRoutes,
    ];

    window.server = createServer({
      routes() {
        this.urlPrefix = "http://localhost:8080";
        this.namespace = "api";
        this.timing = 400;

        routes.forEach((route: MockRouteParams) => {
          this[route.method](route.url, (_, request) => route.result(request));
        });

        this.passthrough();
      },
    });

    return window.server;
  }
}
