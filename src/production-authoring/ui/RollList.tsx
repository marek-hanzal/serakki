import { CircleCheck, Dice5 } from "lucide-react";

import { useEditorItemOptionLabel } from "~/authoring-form/ui/useEditorItemSearchOptions";
import { useEditorProject } from "~/authoring-session/ui/useEditorProject";
import { readRequiredEditorCollectionErrorFn } from "~/editor-control/fn/readRequiredEditorCollectionErrorFn";
import { EditorCollectionSelector } from "~/editor-control/ui/EditorCollectionSelector";
import { EditorFormSectionDivider } from "~/editor-control/ui/EditorFormSectionDivider";
import {
	useFormValidationFocusIndex,
	useFormValidationIssues,
} from "~/item-authoring/ui/useFormValidationIssues";
import type { RollSchema } from "~/outcome/schema/RollSchema";
import type { RollSetSchema } from "~/outcome/schema/RollSetSchema";
import { readOutcomeCollectionSummaryFn } from "~/production-authoring/fn/readOutcomeCollectionSummaryFn";
import { readDraftRollOutcomesFn } from "~/production-authoring/fn/readDraftRollOutcomesFn";
import { DraftDefaults } from "~/production-authoring/ui/DraftDefaults";
import { OutcomeOption } from "~/production-authoring/ui/OutcomeOption";
import { RollControl } from "~/production-authoring/ui/RollControl";
import { Mx } from "~/translation/ui/Mx";
import { useTranslator } from "~/translation/ui/useTranslator";
import type { ActionMenuOption } from "~/ui/ui/ActionMenu";

const RollTypeLabelByType = {
	chance: "Chance",
	guaranteed: "Guaranteed",
} as const satisfies Record<RollSchema.Type["type"], string>;

type RollListValue = RollSetSchema.Type["roll"];

const appendRollFn = (value: RollListValue, type: RollSchema.Type["type"]): RollListValue => [
	...value,
	structuredClone(DraftDefaults.rolls[type]),
];

const duplicateRollFn = (value: RollListValue, index: number): RollListValue =>
	[
		...value.slice(0, index + 1),
		structuredClone(value[index]),
		...value.slice(index + 1),
	] as RollListValue;

const removeRollFn = (value: RollListValue, index: number): RollListValue =>
	value.filter((_current, currentIndex) => currentIndex !== index) as RollListValue;

const replaceRollFn = (value: RollListValue, index: number, next: RollSchema.Type): RollListValue =>
	value.map((current, currentIndex) =>
		currentIndex === index ? next : current,
	) as RollListValue;

const readRollAddOptionsFn = (
	translator: ReturnType<typeof useTranslator>,
	onSelectFn: (type: RollSchema.Type["type"]) => void,
): readonly ActionMenuOption[] => [
	{
		id: "guaranteed",
		label: translator.textFn("Guaranteed"),
		description: translator.textFn("Always produce this roll's outcomes."),
		icon: <CircleCheck className="size-5" />,
		onSelectFn: () => onSelectFn("guaranteed"),
	},
	{
		id: "chance",
		label: translator.textFn("Chance"),
		description: translator.textFn("Produce this roll's outcomes with a chosen chance."),
		icon: <Dice5 className="size-5" />,
		onSelectFn: () => onSelectFn("chance"),
	},
];

export const RollList = ({
	initialRuleIndex,
	initialWhenIndex,
	index,
	initialRollIndex,
	initialOutcomeIndex,
	onChangeFn,
	value,
}: {
	readonly index: number;
	readonly initialRollIndex?: number;
	readonly initialOutcomeIndex?: number;
	readonly onChangeFn: (set: RollSetSchema.Type) => void;
	readonly initialRuleIndex?: number;
	readonly initialWhenIndex?: number;
	readonly value: RollSetSchema.Type;
}) => {
	const readItemLabelFn = useEditorItemOptionLabel();
	const project = useEditorProject();
	const translator = useTranslator();
	const validationIssues = useFormValidationIssues(value);
	const invalidRollIndex = useFormValidationFocusIndex(value, "roll");
	const rollSummaries = value.roll.map((roll) =>
		readOutcomeCollectionSummaryFn({
			outcomes: readDraftRollOutcomesFn(roll),
			templates: project.config.templates,
			readItemLabelFn,
			textFn: translator.textFn,
		}),
	);
	const addOptions = readRollAddOptionsFn(translator, (type) =>
		onChangeFn({
			...value,
			roll: appendRollFn(value.roll, type),
		}),
	);
	return (
		<>
			<EditorFormSectionDivider
				description={<Mx label="Rolls help" />}
				required
				title={translator.textFn("Rolls")}
				variant="secondary"
			/>
			<EditorCollectionSelector
				dataUi="EditorRollsCollection"
				count={value.roll.length}
				error={readRequiredEditorCollectionErrorFn(
					validationIssues,
					value.roll.length,
					1,
					translator.textFn("Add at least one roll."),
					"roll",
				)}
				initialSelectedIndex={initialRollIndex}
				key={initialRollIndex}
				itemLabelFn={(rollIndex) => {
					const roll = value.roll[rollIndex];
					const { label } = rollSummaries[rollIndex];
					return `${translator.textFn(roll.type === undefined ? "Roll" : RollTypeLabelByType[roll.type])} ${rollIndex + 1} — ${label || translator.textFn("No outcome configured.")}`;
				}}
				itemSearchTermsFn={(rollIndex) => rollSummaries[rollIndex].searchTerms}
				renderItemContentFn={(rollIndex, label) => (
					<OutcomeOption
						label={label}
						outcomes={readDraftRollOutcomesFn(value.roll[rollIndex])}
					/>
				)}
				label={`${translator.textFn("Outcome set")} ${index + 1} ${translator.textFn("rolls")}`}
				addOptions={addOptions}
				onDuplicateFn={(rollIndex) =>
					onChangeFn({
						...value,
						roll: duplicateRollFn(value.roll, rollIndex),
					})
				}
				onRemoveFn={(rollIndex) =>
					onChangeFn({
						...value,
						roll: removeRollFn(value.roll, rollIndex),
					})
				}
				selectedIndex={invalidRollIndex}
			>
				{(rollIndex) => (
					<RollControl
						initialRuleIndex={
							rollIndex === initialRollIndex ? initialRuleIndex : undefined
						}
						initialWhenIndex={
							rollIndex === initialRollIndex ? initialWhenIndex : undefined
						}
						value={value.roll[rollIndex]}
						initialOutcomeIndex={
							rollIndex === initialRollIndex ? initialOutcomeIndex : undefined
						}
						onChangeFn={(next) =>
							onChangeFn({
								...value,
								roll: replaceRollFn(value.roll, rollIndex, next),
							})
						}
					/>
				)}
			</EditorCollectionSelector>
		</>
	);
};
