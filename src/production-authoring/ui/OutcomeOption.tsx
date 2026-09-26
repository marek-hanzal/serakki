import { PanelsTopLeft } from "lucide-react";

import { useEditorItemOptionLabel } from "~/authoring-form/ui/useEditorItemSearchOptions";
import { EditorItemThumbnail } from "~/authoring-form/ui/EditorItemThumbnail";
import { useEditorProject } from "~/authoring-session/ui/useEditorProject";
import { EditorCollectionOption } from "~/editor-control/ui/EditorCollectionOption";
import type { OutcomeSchema } from "~/outcome/schema/OutcomeSchema";
import { readOutcomePresentationFn } from "~/production-authoring/fn/readOutcomePresentationFn";
import { useTranslator } from "~/translation/ui/useTranslator";

/** Lists possible emitted identities, not condition references or guaranteed runtime outcomes. */
export const OutcomeOption = ({
	label,
	outcomes,
	summary,
}: {
	readonly label: string;
	readonly outcomes: readonly OutcomeSchema.Type[];
	readonly summary?: string;
}) => {
	const project = useEditorProject();
	const translator = useTranslator();
	const readItemLabelFn = useEditorItemOptionLabel();
	const entries = outcomes.map((outcome) => ({
		outcome,
		presentation: readOutcomePresentationFn({
			outcome,
			templates: project.config.templates,
			readItemLabelFn,
			textFn: translator.textFn,
		}),
	}));
	const itemUids = [
		...new Set(
			entries.flatMap(({ outcome }) =>
				outcome.type === "item"
					? [
							outcome.itemUid,
						]
					: [],
			),
		),
	];
	return (
		<EditorCollectionOption
			label={label}
			details={
				summary === undefined ? undefined : (
					<span className="text-xs text-subtle">{summary}</span>
				)
			}
		>
			{itemUids.map((id) => (
				<EditorItemThumbnail
					key={id}
					size="md"
					className="rounded-md"
					resourceUids={
						project.config.items[id]?.artwork.default ?? [
							"",
						]
					}
				/>
			))}
			{entries
				.filter(({ outcome }) => outcome.type === "space")
				.map(({ presentation }, index) => (
					<span
						key={`space:${index}`}
						className="text-xs"
					>
						{presentation.label}
					</span>
				))}
			{entries
				.filter(({ outcome }) => outcome.type === "template")
				.map(({ presentation }, index) => (
					<span
						key={`template:${index}`}
						className="flex items-center gap-1 text-xs"
					>
						<PanelsTopLeft className="size-4" />
						{presentation.label}
					</span>
				))}
		</EditorCollectionOption>
	);
};
