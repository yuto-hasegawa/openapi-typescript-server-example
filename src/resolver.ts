import { Controller } from "eov-handler-adapter";
import { RouteMetadata } from "express-openapi-validator/dist/framework/openapi.spec.loader.js";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

type HttpMethod =
  | "get"
  | "put"
  | "post"
  | "delete"
  | "options"
  | "head"
  | "patch"
  | "trace";

export const resolver =
  (handlers: Record<string, Controller>) =>
  (_: string, route: RouteMetadata, apiDoc: OpenAPIV3.Document) => {
    const pathKey = route.openApiRoute.slice(route.basePath.length);
    const schema =
      apiDoc.paths[pathKey][route.method.toLowerCase() as HttpMethod];
    if (!schema) {
      throw new Error(`No schema found for ${route.method} ${pathKey}`);
    }
    const operationId = schema.operationId;
    if (!operationId) {
      throw new Error(
        `operationId is not defined on ${route.method} ${pathKey}`
      );
    }
    const handle = handlers[operationId];
    if (!handle) {
      throw new Error(`Handler is not registered for ${operationId}`);
    }
    return handle;
  };
