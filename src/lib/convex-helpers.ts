import type { SystemTableNames } from "convex/server";
import type { Id, TableNames } from "../../convex/_generated/dataModel";

/**
 * Cast a string (e.g. from URL params) to a Convex Id type.
 * This is a type-only cast — Convex IDs are strings at runtime.
 */
export function asId<T extends TableNames | SystemTableNames>(
	id: string,
): Id<T> {
	return id as unknown as Id<T>;
}
