import { FileUp, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface PUCUploadProps {
	onFileSelect: (file: File) => void;
	disabled?: boolean;
}

export function PUCUpload({ onFileSelect, disabled }: PUCUploadProps) {
	const { t } = useI18n();
	const inputRef = useRef<HTMLInputElement>(null);
	const [dragActive, setDragActive] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleFile = useCallback(
		(file: File) => {
			if (file.type !== "application/pdf") return;
			setSelectedFile(file);
			onFileSelect(file);
		},
		[onFileSelect],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDragActive(false);
			const file = e.dataTransfer.files[0];
			if (file) handleFile(file);
		},
		[handleFile],
	);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) handleFile(file);
		},
		[handleFile],
	);

	const clearFile = useCallback(() => {
		setSelectedFile(null);
		if (inputRef.current) inputRef.current.value = "";
	}, []);

	return (
		<div className="space-y-3">
			<button
				type="button"
				className={`
					relative w-full border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
					${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"}
					${disabled ? "opacity-50 cursor-not-allowed" : ""}
				`}
				onDragOver={(e) => {
					e.preventDefault();
					setDragActive(true);
				}}
				onDragLeave={() => setDragActive(false)}
				onDrop={handleDrop}
				onClick={() => !disabled && inputRef.current?.click()}
				disabled={disabled}
			>
				<input
					ref={inputRef}
					type="file"
					accept=".pdf"
					className="hidden"
					onChange={handleChange}
					disabled={disabled}
				/>
				<div className="flex flex-col items-center gap-3">
					<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
						<FileUp className="w-6 h-6 text-primary" />
					</div>
					<div>
						<p className="text-sm font-medium">{t.puc.dropzone}</p>
						<p className="text-xs text-muted-foreground mt-1">PDF</p>
					</div>
				</div>
			</button>

			{selectedFile && (
				<div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
					<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
						<FileUp className="w-4 h-4 text-primary" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium truncate">{selectedFile.name}</p>
						<p className="text-xs text-muted-foreground">
							{(selectedFile.size / 1024).toFixed(0)} KB
						</p>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-7 w-7 shrink-0"
						onClick={(e) => {
							e.stopPropagation();
							clearFile();
						}}
					>
						<X className="w-3.5 h-3.5" />
					</Button>
				</div>
			)}
		</div>
	);
}
