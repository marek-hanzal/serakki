import { editEditorCollectionFn } from "~/editor-control/fn/editEditorCollectionFn";
import type { createTranslatorFn } from "~/translation/fn/createTranslatorFn";
import { DoorOpen, History, MapPin, PanelsTopLeft, Shuffle, Sparkles } from "lucide-react";

import { useEditorItemOptionLabel } from "~/authoring-form/ui/useEditorItemSearchOptions";
import { EditorItemSearchThumbnail } from "~/authoring-form/ui/EditorItemThumbnail";
import { useEditorProject } from "~/authoring-session/ui/useEditorProject";
import { readRequiredEditorCollectionErrorFn } from "~/editor-control/fn/readRequiredEditorCollectionErrorFn";
import { EditorCollectionSelector } from "~/editor-control/ui/EditorCollectionSelector";
import { EditorFormSectionDivider } from "~/editor-control/ui/EditorFormSectionDivider";
import {
	useFormValidationFocusIndex,
	useFormValidationIssues,
} from "~/item-authoring/ui/useFormValidationIssues";
import type { OutcomeSchema } from "~/outcome/schema/OutcomeSchema";
import { DraftDefaults } from "~/production-authoring/ui/DraftDefaults";
import { readOutcomePresentationFn } from "~/production-authoring/fn/readOutcomePresentationFn";
import { OutcomeFields } from "~/production-authoring/ui/OutcomeFields";
import { OutcomeOption } from "~/production-authoring/ui/OutcomeOption";
import { Mx } from "~/translation/ui/Mx";
import type { ActionMenuOption } from "~/ui/ui/ActionMenu";
import { useTranslator } from "~/translation/ui/useTranslator";

type OutcomeDraftKind =
	| "drop-local"
	| "drop-random"
	| "space"
	| "space-previous"
	| "space-inventory"
	| "template";

const createOutcomeDraftFn = (
	kind: OutcomeDraftKind,
	inventoryTemplateUid: string | undefined,
): OutcomeSchema.Type => {
	if (kind === "drop-local") return structuredClone(DraftDefaults.itemOutcome);
	if (kind === "drop-random")
		return {
			...structuredClone(DraftDefaults.itemOutcome),
			placement: "random",
		};
	if (kind === "space")
		return {
			type: "space",
			space: 0,
			rules: [],
		};
	if (kind === "space-previous")
		return {
			type: "space",
			space: "previous",
			rules: [],
		};
	if (kind === "space-inventory")
		return {
			type: "space",
			space: {
				type: "inventory",
				templateUid: inventoryTemplateUid ?? "",
			},
			rules: [],
		};
	return {
		type: "template",
		templateUid: "",
		rules: [],
	};
};

const readOutcomeAddOptionsFn = (
	translator: createTranslatorFn.Translator,
	onSelectFn: (kind: OutcomeDraftKind) => void,
): readonly ActionMenuOption[] => [
	{
		id: "drop-local",
		label: translator.textFn("Drop - Local"),
		description: translator.textFn("Place items in nearby empty cells beside the producer."),
		icon: <MapPin className="size-5" />,
		onSelectFn: () => onSelectFn("drop-local"),
	},
	{
		id: "drop-random",
		label: translator.textFn("Drop - Random"),
		description: translator.textFn("Place items near random cells on the current Board."),
		icon: <Shuffle className="size-5" />,
		onSelectFn: () => onSelectFn("drop-random"),
	},
	{
		id: "space",
		label: translator.textFn("Space"),
		description: translator.textFn("Move to an exact space number."),
		icon: <DoorOpen className="size-5" />,
		onSelectFn: () => onSelectFn("space"),
	},
	{
		id: "space-previous",
		label: translator.textFn("Previous Space"),
		description: translator.textFn(
			"Return to the last space left. Without history, this outcome does nothing.",
		),
		icon: <History className="size-5" />,
		onSelectFn: () => onSelectFn("space-previous"),
	},
	{
		id: "space-inventory",
		label: translator.textFn("Inventory"),
		description: translator.textFn(
			"Open this item's Inventory, an item-owned Space initialized from a template on first use.",
		),
		icon: <Sparkles className="size-5" />,
		onSelectFn: () => onSelectFn("space-inventory"),
	},
	{
		id: "template",
		label: translator.textFn("Template"),
		description: translator.textFn(
			"Replaces the outcome origin space with this template, or an explicit target space when configured.",
		),
		icon: <PanelsTopLeft className="size-5" />,
		onSelectFn: () => onSelectFn("template"),
	},
];

export const OutcomeList = ({
	initialRuleIndex,
	initialWhenIndex,
	initialOutcomeIndex,
	onChangeFn,
	value,
}: {
	readonly initialOutcomeIndex?: number;
	readonly onChangeFn: (outcomes: OutcomeSchema.Type[]) => void;
	readonly initialRuleIndex?: number;
	readonly initialWhenIndex?: number;
	readonly value: OutcomeSchema.Type[];
}) => {
	const readItemLabelFn = useEditorItemOptionLabel();
	const project = useEditorProject();
	const items = project.config.items ?? {};
	const translator = useTranslator();
	const validationIssues = useFormValidationIssues(value);
	const invalidOutcomeIndex = useFormValidationFocusIndex(value as object);
	const presentations = value.map((outcome) =>
		readOutcomePresentationFn({
			outcome,
			templates: project.config.templates,
			readItemLabelFn,
			textFn: translator.textFn,
		}),
	);
	const onEditFn = (edit: editEditorCollectionFn.Edit<OutcomeSchema.Type>) =>
		onChangeFn(editEditorCollectionFn(value, edit));
	const addOptions = readOutcomeAddOptionsFn(translator, (kind) =>
		onEditFn({
			type: "append",
			value: createOutcomeDraftFn(kind, project.config.templates?.[0]?.uid),
		}),
	);
	return (
		<section className="grid gap-3">
			<EditorFormSectionDivider
				description={<Mx label="Outcomes help" />}
				title={translator.textFn("Outcomes")}
				variant="secondary"
			/>
			<EditorCollectionSelector
				dataUi="EditorOutcomesCollection"
				count={value.length}
				error={readRequiredEditorCollectionErrorFn(
					validationIssues,
					value.length,
					1,
					translator.textFn("Add at least one outcome."),
				)}
				initialSelectedIndex={initialOutcomeIndex}
				key={initialOutcomeIndex}
				itemLabelFn={(index) => {
					const { label } = presentations[index];
					return `${translator.textFn("Outcome")} ${index + 1} — ${label}`;
				}}
				itemSearchTermsFn={(index) => presentations[index].searchTerms}
				label={translator.textFn("Outcomes")}
				itemMetaFn={(index) => presentations[index].summary}
				renderItemContentFn={(index, label) => (
					<OutcomeOption
						label={label}
						outcomes={[
							value[index],
						]}
						summary={presentations[index].summary}
					/>
				)}
				renderSelectedItemPreviewFn={(index) => (
					<EditorItemSearchThumbnail
						item={
							index === undefined || value[index]?.type !== "item"
								? undefined
								: items[value[index].itemUid]
						}
						selected
					/>
				)}
				addOptions={addOptions}
				onDuplicateFn={(index) =>
					onEditFn({
						type: "duplicate",
						index,
						copyFn: structuredClone,
					})
				}
				onRemoveFn={(index) =>
					onEditFn({
						type: "remove",
						index,
					})
				}
				selectedIndex={invalidOutcomeIndex}
			>
				{(index) => (
					<OutcomeFields
						initialRuleIndex={
							index === initialOutcomeIndex ? initialRuleIndex : undefined
						}
						initialWhenIndex={
							index === initialOutcomeIndex ? initialWhenIndex : undefined
						}
						value={value[index]}
						onChangeFn={(next) =>
							onEditFn({
								type: "replace",
								index,
								value: next,
							})
						}
					/>
				)}
			</EditorCollectionSelector>
		</section>
	);
};
