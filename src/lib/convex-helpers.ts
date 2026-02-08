import type { Id } from "../../convex/_generated/dataModel";

/**
 * Cast a string (e.g. from URL params) to a Convex Id type.
 * This is a type-only cast — Convex IDs are strings at runtime.
 */
export function asId<T extends string>(id: string): Id<T> {
	return id as unknown as Id<T>;
}
