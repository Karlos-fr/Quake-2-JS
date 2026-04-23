/**
 * File: index.ts
 * Purpose: Expose the Quake II server package entry points.
 *
 * This file is not a direct source port.
 * It is a package entry point for server-side modules.
 *
 * Dependencies:
 * - packages/server/src/server.ts
 */

export {
  client_state_t,
  computeServerClientEntityCapacity,
  createChallenge,
  createClientFrame,
  createServerClient,
  createServerHeaderState,
  createServerState,
  createServerStatic,
  EDICT_NUM,
  LATENCY_COUNTS,
  MAX_CHALLENGES,
  MAX_MASTERS,
  MAX_PACKET_ENTITIES,
  RATE_MESSAGES,
  redirect_t,
  server_state_t,
  SV_OUTPUTBUF_LENGTH,
  NUM_FOR_EDICT
} from "./server.js";

export { SV_Frame, SV_Init, SV_Shutdown } from "./sv_null.js";

export type {
  challenge_t,
  client_frame_t,
  client_t,
  cmodel_s,
  ServerConsoleProcedures,
  ServerEntityProcedures,
  ServerGameProcedures,
  ServerHeaderState,
  ServerInitProcedures,
  ServerMainProcedures,
  server_static_t,
  server_t,
  ServerPhysicsProcedures,
  ServerSendProcedures,
  ServerUserProcedures,
  ServerWorldProcedures
} from "./server.js";
