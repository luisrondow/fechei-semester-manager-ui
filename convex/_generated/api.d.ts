/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as briefs from "../briefs.js";
import type * as dashboard from "../dashboard.js";
import type * as events from "../events.js";
import type * as helpers from "../helpers.js";
import type * as puc from "../puc.js";
import type * as pucProcessing from "../pucProcessing.js";
import type * as resources from "../resources.js";
import type * as seed from "../seed.js";
import type * as semesters from "../semesters.js";
import type * as subjects from "../subjects.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  briefs: typeof briefs;
  dashboard: typeof dashboard;
  events: typeof events;
  helpers: typeof helpers;
  puc: typeof puc;
  pucProcessing: typeof pucProcessing;
  resources: typeof resources;
  seed: typeof seed;
  semesters: typeof semesters;
  subjects: typeof subjects;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
