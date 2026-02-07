import {
	addPUCDocument,
	getPUCBySubject,
	updatePUCStatus,
} from "@/data/mock/store";
import type { PUCDocument, PUCProcessingStatus } from "@/lib/types";

function delay(ms = 100): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchPUCBySubject(
	subjectId: string,
): Promise<PUCDocument | null> {
	await delay(80);
	return getPUCBySubject(subjectId) ?? null;
}

export async function uploadPUC(
	subjectId: string,
	fileName: string,
): Promise<PUCDocument> {
	await delay(200);
	const doc = addPUCDocument({
		subjectId,
		fileName,
		extractedText: null,
		language: "pt",
		status: "uploading",
		version: 1,
	});
	return doc;
}

export async function fetchPUCStatus(
	_pucId: string,
): Promise<PUCProcessingStatus> {
	await delay(100);
	// Simulate processing pipeline: uploading → processing → extracted
	// In the mock, we advance the status each time this is polled
	return "processing";
}

export async function simulatePUCProcessing(
	pucId: string,
): Promise<PUCDocument> {
	// Step 1: uploading → processing
	await delay(1500);
	updatePUCStatus(pucId, "processing");

	// Step 2: processing → extracted
	await delay(2500);
	updatePUCStatus(pucId, "extracted");

	const doc = getPUCBySubject(pucId);
	if (!doc) throw new Error(`PUC not found: ${pucId}`);
	return doc;
}
