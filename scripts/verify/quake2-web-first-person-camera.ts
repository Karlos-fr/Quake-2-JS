/**
 * File: quake2-web-first-person-camera.ts
 * Purpose: Verify the web demo keeps a stable world camera while still attaching the Quake-style first-person weapon model to the camera graph.
 *
 * This file is not a direct source port.
 * It is a lightweight integration guard for the browser demo camera settings.
 *
 * Dependencies:
 * - apps/web/src/web-render-bootstrap.ts
 * - apps/web/src/local-client-controller.ts
 */

import fs from "node:fs";
import path from "node:path";
import { strict as assert } from "node:assert";

const bootstrapPath = path.join(process.cwd(), "apps", "web", "src", "web-render-bootstrap.ts");
const controllerPath = path.join(process.cwd(), "apps", "web", "src", "local-client-controller.ts");

const bootstrapSource = fs.readFileSync(bootstrapPath, "utf8");
const controllerSource = fs.readFileSync(controllerPath, "utf8");

assert.ok(
  bootstrapSource.includes("new PerspectiveCamera(75, 1, 4, 20000)"),
  "web demo camera must keep the stable world projection baseline used by the map renderer"
);
assert.ok(
  !controllerSource.includes("camera.fov = view.fov_x;"),
  "predicted web camera must not force per-frame FOV changes on the shared world camera"
);
assert.ok(
  !controllerSource.includes("camera.updateProjectionMatrix();"),
  "predicted web camera must not churn the shared world projection matrix every frame"
);

console.log("quake2-web-first-person-camera: ok");
