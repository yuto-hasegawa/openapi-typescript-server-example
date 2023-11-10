import express from "express";
import OpenApiValidator from "express-openapi-validator";
import {
  Controller,
  EOVHandlerAdapter,
  Handler,
  HandlerResponse,
  typeScriptNodeGenCoordinator,
} from "eov-handler-adapter";
import { DefaultApi } from "./genereted/api/defaultApi.js";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { Fruits } from "./genereted/model/fruit.js";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import fs from "fs";
import { BirthExternal } from "./genereted/model/birthExternal.js";
import cookieParser from "cookie-parser";
import { resolver } from "./resolver.js";

// load an API spec
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_SPEC_PATH = path.join(__dirname, "../openapi/index.yaml");
const API_SPEC = yaml.load(
  fs.readFileSync(API_SPEC_PATH, "utf-8")
) as OpenAPIV3.Document;

// define handlers for each operation
const helloHandler: Handler<DefaultApi["hello"]> = async ({ name }) => {
  return HandlerResponse.resolve(`Hello World! ${name}`);
};

const datesHandler: Handler<DefaultApi["dates"]> = async ({
  birthday,
  bornAt,
}) => {
  console.log(`My birthday is ${birthday}`);
  console.log(`I was born at ${bornAt.toISOString()}`);
  return HandlerResponse.resolve(undefined);
};

const singleFileHandler: Handler<DefaultApi["singleFile"]> = async ({
  body,
}) => {
  console.log("Received: ", body);
  if (body instanceof Buffer) {
    console.log("Content: ", body.toString("utf-8"));
  } else {
    console.log("Destination: ", body.destination);
  }
  return HandlerResponse.resolve(undefined);
};

const multiFileHandler: Handler<DefaultApi["multiFile"]> = async ({
  file,
  files,
}) => {
  console.log("file", file);
  console.log("files", files);
  return HandlerResponse.resolve(undefined);
};

const withRefsHandler: Handler<DefaultApi["withRefs"]> = async ({
  profile,
}) => {
  console.log("profile", profile);
  const birth: BirthExternal = {
    birthday: "2020-01-01",
    born_at: new Date("2020-01-01T13:00:00.000+09:00"),
    birth_month: { year: 2020, month: 1 },
  };
  return HandlerResponse.resolve(birth);
};

const enumsHandler: Handler<DefaultApi["enums"]> = async ({}) => {
  return HandlerResponse.resolve([Fruits.Strawberry, Fruits.Grape]);
};

const inlineObjectsHandler: Handler<DefaultApi["inlineObjects"]> = async ({
  inlineObjectsRequest,
}) => {
  console.log("request", inlineObjectsRequest);
  return HandlerResponse.resolve({ name: "Hanako", age: 30 });
};

const parametersHandler: Handler<DefaultApi["parameters"]> = async ({
  id,
  limit,
  q,
  xRequestID,
  sessionId,
}) => {
  console.log("id", id);
  console.log("limit", limit);
  console.log("q", q);
  console.log("xRequestID", xRequestID);
  console.log("sessionId", sessionId);
  return HandlerResponse.resolve(undefined);
};

// register handlers
const adapter = new EOVHandlerAdapter(
  API_SPEC,
  typeScriptNodeGenCoordinator({ paramNaming: "camelCase" })
);
const handlers: Record<string, Controller> = {
  hello: adapter.connect(helloHandler),
  dates: adapter.connect(datesHandler),
  singleFile: adapter.connect(singleFileHandler),
  multiFile: adapter.connect(multiFileHandler),
  withRefs: adapter.connect(withRefsHandler),
  enums: adapter.connect(enumsHandler),
  inlineObjects: adapter.connect(inlineObjectsHandler),
  parameters: adapter.connect(parametersHandler),
};

// set up express
const app = express();
app.use(express.raw());
app.use(express.json());
app.use(cookieParser());
app.use(
  OpenApiValidator.middleware({
    apiSpec: API_SPEC_PATH,
    operationHandlers: {
      basePath: "",
      resolver: resolver(handlers),
    },
    serDes: [
      OpenApiValidator.serdes.dateTime.deserializer,
      OpenApiValidator.serdes.dateTime.serializer,
      OpenApiValidator.serdes.date.serializer,
    ],
    fileUploader: {
      dest: "uploads",
    },
    $refParser: {
      mode: "dereference", // important!
    },
  })
);
app.listen(3000);
console.log("Listening on port 3000");
