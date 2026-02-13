declare module "pdf-parse/lib/pdf-parse.js" {
	function pdf(
		dataBuffer: Buffer,
		options?: Record<string, unknown>,
	): Promise<{ numpages: number; text: string }>;
	export = pdf;
}
