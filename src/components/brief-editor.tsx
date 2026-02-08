import { Pencil, RotateCcw, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateBrief } from "@/hooks/queries/use-briefs";
import { asId } from "@/lib/convex-helpers";
import { useI18n } from "@/lib/i18n";
import type { SubjectBrief } from "@/lib/types";

interface BriefEditorProps {
	brief: SubjectBrief;
	subjectId: string;
	readOnly?: boolean;
}

export function BriefEditor({ brief, subjectId, readOnly }: BriefEditorProps) {
	const { t } = useI18n();
	const updateBrief = useUpdateBrief(subjectId);

	const displayText = brief.userEditedText ?? brief.generatedText;
	const isEdited = brief.userEditedText !== null;

	const [editing, setEditing] = useState(false);
	const [editText, setEditText] = useState(displayText);

	const handleSave = useCallback(async () => {
		await updateBrief.mutateAsync({
			id: asId<"subjectBriefs">(brief.id),
			userEditedText: editText,
		});
		setEditing(false);
		toast.success(t.brief.saved);
	}, [brief.id, editText, updateBrief, t.brief.saved]);

	const handleReset = useCallback(async () => {
		await updateBrief.mutateAsync({
			id: asId<"subjectBriefs">(brief.id),
			userEditedText: null,
		});
		setEditText(brief.generatedText);
		setEditing(false);
		toast.success(t.brief.resetDone);
	}, [brief.id, brief.generatedText, updateBrief, t.brief.resetDone]);

	return (
		<div className="space-y-4">
			{/* Header bar */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					{isEdited ? (
						<Badge
							variant="outline"
							className="bg-primary/10 text-primary border-primary/25 text-[10px]"
						>
							<Pencil className="w-3 h-3 mr-0.5" />
							{t.brief.edited}
						</Badge>
					) : (
						<Badge
							variant="outline"
							className="bg-info/10 text-info border-info/25 text-[10px]"
						>
							<Sparkles className="w-3 h-3 mr-0.5" />
							{t.brief.generated}
						</Badge>
					)}
					<ConfidenceBadge score={brief.confidenceScore} />
				</div>

				{!readOnly && (
					<div className="flex items-center gap-2">
						{isEdited && !editing && (
							<Button variant="ghost" size="sm" onClick={handleReset}>
								<RotateCcw className="w-3.5 h-3.5 mr-1" />
								{t.brief.reset}
							</Button>
						)}
						{!editing && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setEditText(displayText);
									setEditing(true);
								}}
							>
								<Pencil className="w-3.5 h-3.5 mr-1" />
								{t.brief.edit}
							</Button>
						)}
					</div>
				)}
			</div>

			{/* Content */}
			{editing ? (
				<div className="space-y-3">
					<Textarea
						value={editText}
						onChange={(e) => setEditText(e.target.value)}
						rows={16}
						className="font-mono text-sm"
					/>
					<div className="flex gap-2">
						<Button size="sm" onClick={handleSave}>
							{t.common.save}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setEditing(false)}
						>
							{t.common.cancel}
						</Button>
					</div>
				</div>
			) : (
				<div className="rounded-xl border border-border bg-card p-6">
					<div className="prose prose-sm max-w-none">
						{displayText.split("\n").map((line, i) => {
							const key = `line-${i}`;
							if (line.startsWith("## ")) {
								return (
									<h2
										key={key}
										className="font-display text-lg mt-6 mb-2 first:mt-0"
									>
										{line.slice(3)}
									</h2>
								);
							}
							if (line.startsWith("- ")) {
								return (
									<li key={key} className="text-sm text-muted-foreground ml-4">
										{line.slice(2)}
									</li>
								);
							}
							if (line.match(/^\d+\.\s\*\*/)) {
								const cleaned = line
									.replace(/\*\*/g, "")
									.replace(/^\d+\.\s/, "");
								const num = line.match(/^\d+/)?.[0];
								return (
									<div key={key} className="flex gap-2 text-sm py-0.5">
										<span className="text-primary font-medium shrink-0">
											{num}.
										</span>
										<span>{cleaned}</span>
									</div>
								);
							}
							if (line.trim() === "") {
								return <div key={key} className="h-2" />;
							}
							return (
								<p key={key} className="text-sm text-muted-foreground">
									{line}
								</p>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
