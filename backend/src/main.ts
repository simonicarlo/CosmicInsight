import path from "path";

import express from "express";

import cors from "cors";
import dotenv from "dotenv";

import solarsystemHandlers from "./solarsystem";
import systemSolaireHandler from "./systemSolaire";
import planetDataHandlers from "./planetdata";
import imageHandlers from "./spaceimages";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

// Load the appropriate file
dotenv.config({ path: path.resolve(__dirname, envFile) });

const FrontendPort = process.env.VITE_FRONTEND_PORT || 5100;
const BackendPort = process.env.BACKEND_PORT || 5050;

console.log("BACKEND_PORT", BackendPort);
console.log("FRONTEND_PORT", FrontendPort);

const corsOptions = {
  origin: [`http://localhost:${FrontendPort}`, "https://fp-p7.fwe24.ivia.ch"], // your frontend URLs
};

const app = express();

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use("/api/solarsystem", solarsystemHandlers);

app.use("/api/syssolaire", systemSolaireHandler);

app.use("/api/planets", planetDataHandlers);

app.use("/api/images", imageHandlers);

// Catch all other routes and return an error
app.get("*", (req, res) => {
  res.status(404).send("Not found - Cannot GET " + req.originalUrl);
});

// Do not change below this line
app.listen(BackendPort, () =>
  console.log(`Server is listening on http://localhost:${BackendPort}.`)
);
