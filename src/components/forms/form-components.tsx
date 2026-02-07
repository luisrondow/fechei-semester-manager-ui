import { useStore } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as ShadcnSelect from "@/components/ui/select";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { useFieldContext, useFormContext } from "./form-context";

function ErrorMessages({
	errors,
}: {
	errors: Array<string | { message: string }>;
}) {
	return (
		<>
			{errors.map((error) => (
				<p
					key={typeof error === "string" ? error : error.message}
					className="text-sm text-destructive-foreground mt-1"
				>
					{typeof error === "string" ? error : error.message}
				</p>
			))}
		</>
	);
}

export function SubscribeButton({ label }: { label: string }) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" disabled={isSubmitting}>
					{label}
				</Button>
			)}
		</form.Subscribe>
	);
}

export function TextField({
	label,
	placeholder,
}: {
	label: string;
	placeholder?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<div className="space-y-2">
			<Label htmlFor={field.name}>{label}</Label>
			<Input
				id={field.name}
				value={field.state.value}
				placeholder={placeholder}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</div>
	);
}

export function TextArea({
	label,
	rows = 3,
	placeholder,
}: {
	label: string;
	rows?: number;
	placeholder?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<div className="space-y-2">
			<Label htmlFor={field.name}>{label}</Label>
			<ShadcnTextarea
				id={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				rows={rows}
				placeholder={placeholder}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</div>
	);
}

export function Select({
	label,
	values,
	placeholder,
}: {
	label: string;
	values: Array<{ label: string; value: string }>;
	placeholder?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<div className="space-y-2">
			<Label htmlFor={field.name}>{label}</Label>
			<ShadcnSelect.Select
				name={field.name}
				value={field.state.value}
				onValueChange={(value) => field.handleChange(value)}
			>
				<ShadcnSelect.SelectTrigger className="w-full">
					<ShadcnSelect.SelectValue placeholder={placeholder} />
				</ShadcnSelect.SelectTrigger>
				<ShadcnSelect.SelectContent>
					<ShadcnSelect.SelectGroup>
						<ShadcnSelect.SelectLabel>{label}</ShadcnSelect.SelectLabel>
						{values.map((v) => (
							<ShadcnSelect.SelectItem key={v.value} value={v.value}>
								{v.label}
							</ShadcnSelect.SelectItem>
						))}
					</ShadcnSelect.SelectGroup>
				</ShadcnSelect.SelectContent>
			</ShadcnSelect.Select>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</div>
	);
}

export function DateField({ label }: { label: string }) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<div className="space-y-2">
			<Label htmlFor={field.name}>{label}</Label>
			<Input
				id={field.name}
				type="date"
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</div>
	);
}
