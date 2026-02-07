import {
	addResource,
	getResourcesBySubject,
	removeResource,
	togglePinResource,
	updateResource as updateResourceInStore,
} from "@/data/mock/store";
import type {
	CreateResourceInput,
	Resource,
	UpdateResourceInput,
} from "@/lib/types";

function delay(ms = 100): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchResourcesBySubject(
	subjectId: string,
): Promise<Resource[]> {
	await delay(80);
	return getResourcesBySubject(subjectId);
}

export async function createResource(
	input: CreateResourceInput,
): Promise<Resource> {
	await delay(150);
	return addResource({
		subjectId: input.subjectId,
		sourceType: "user_saved",
		resourceType: "other",
		title: input.title,
		authors: null,
		url: input.url || null,
		notes: input.notes || null,
		tags: input.tags || [],
		pinned: false,
	});
}

export async function updateResource(
	id: string,
	data: UpdateResourceInput,
): Promise<Resource> {
	await delay(120);
	const updated = updateResourceInStore(id, data);
	if (!updated) throw new Error(`Resource not found: ${id}`);
	return updated;
}

export async function deleteResource(id: string): Promise<void> {
	await delay(100);
	const removed = removeResource(id);
	if (!removed) throw new Error(`Resource not found: ${id}`);
}

export async function togglePin(id: string): Promise<Resource> {
	await delay(80);
	const toggled = togglePinResource(id);
	if (!toggled) throw new Error(`Resource not found: ${id}`);
	return toggled;
}
