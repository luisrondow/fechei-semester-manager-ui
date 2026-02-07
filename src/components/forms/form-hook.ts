import { createFormHook } from "@tanstack/react-form";
import {
	DateField,
	Select,
	SubscribeButton,
	TextArea,
	TextField,
} from "./form-components";
import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		TextArea,
		Select,
		DateField,
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});
