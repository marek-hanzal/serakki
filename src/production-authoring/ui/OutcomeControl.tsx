import { editEditorCollectionFn } from "~/editor-control/fn/editEditorCollectionFn";
import type { RollSetSchema } from "~/outcome/schema/RollSetSchema";
import { readOutcomeCollectionSummaryFn } from "~/production-authoring/fn/readOutcomeCollectionSummaryFn";
import { useEditorProject } from "~/authoring-session/ui/useEditorProject";
import { useFormSession } from "~/item-authoring/ui/FormContext";
import type { OutcomeTableSchema } from "~/outcome/schema/OutcomeTableSchema";
import { EditorCollectionSelector } from "~/editor-control/ui/EditorCollectionSelector";
import { DraftDefaults } from "~/production-authoring/ui/DraftDefaults";
import { RollSetControl } from "~/production-authoring/ui/RollSetControl";
import { OutcomeOption } from "~/production-authoring/ui/OutcomeOption";
import { readDraftRollOutcomesFn } from "~/production-authoring/fn/readDraftRollOutcomesFn";
import { useEditorItemOptionLabel } from "~/authoring-form/ui/useEditorItemSearchOptions";
import {
	useFormValidationFocusIndex,
	useFormValidationIssues,
} from "~/item-authoring/ui/useFormValidationIssues";
import { readRequiredEditorCollectionErrorFn } from "~/editor-control/fn/readRequiredEditorCollectionErrorFn";
import { useTranslator } from "~/translation/ui/useTranslator";

/** Removing the last set removes the optional outcome table from its owner. */
const editOutcomeSetsFn = (
	value: OutcomeTableSchema.Type | undefined,
	edit: editEditorCollectionFn.Edit<RollSetSchema.Type>,
): OutcomeTableSchema.Type | undefined => {
	const set = editEditorCollectionFn(value?.set ?? [], edit);
	return set.length === 0
		? undefined
		: {
				set: set as OutcomeTableSchema.Type["set"],
			};
};

interface OutcomeControlProps {
	readonly onChangeFn: (outcome: OutcomeTableSchema.Type | undefined) => void;
	readonly value: OutcomeTableSchema.Type | undefined;
}

/** Edits weighted outcome sets through their concrete RollSet domain. */
export const OutcomeControl = ({ onChangeFn, value }: OutcomeControlProps) => {
	const project = useEditorProject();
	const translator = useTranslator();
	const { outcomeSetIndex, outcomeRollIndex, outcomeIndex, ruleIndex, whenIndex } =
		useFormSession();
	const readItemLabelFn = useEditorItemOptionLabel();
	const validationIssues = useFormValidationIssues(value);
	const sets = value?.set ?? [];
	const invalidSetIndex = useFormValidationFocusIndex(value, "set");
	const onEditFn = (edit: editEditorCollectionFn.Edit<RollSetSchema.Type>) =>
		onChangeFn(editOutcomeSetsFn(value, edit));
	return (
		<section className="grid gap-3">
			<EditorCollectionSelector
				dataUi="EditorOutcomeSetsCollection"
				count={sets.length}
				error={readRequiredEditorCollectionErrorFn(
					validationIssues,
					sets.length,
					1,
					translator.textFn("Add at least one outcome set."),
					"set",
				)}
				initialSelectedIndex={outcomeSetIndex}
				key={outcomeSetIndex}
				itemLabelFn={(index) => {
					const roll = sets[index]?.roll[0];
					const { label } = readOutcomeCollectionSummaryFn({
						outcomes: roll === undefined ? [] : readDraftRollOutcomesFn(roll),
						templates: project.config.templates,
						readItemLabelFn,
						textFn: translator.textFn,
					});
					return `${translator.textFn("Outcome set")} ${index + 1} — ${label || translator.textFn("No outcome configured.")}`;
				}}
				itemSearchTermsFn={(index) =>
					readOutcomeCollectionSummaryFn({
						outcomes: (sets[index]?.roll ?? []).flatMap(readDraftRollOutcomesFn),
						templates: project.config.templates,
						readItemLabelFn,
						textFn: translator.textFn,
					}).searchTerms
				}
				renderItemContentFn={(index, label) => (
					<OutcomeOption
						label={label}
						outcomes={(sets[index]?.roll ?? []).flatMap(readDraftRollOutcomesFn)}
					/>
				)}
				label={translator.textFn("Outcome sets")}
				onAddFn={() =>
					onEditFn({
						type: "append",
						value: structuredClone(DraftDefaults.outcome.set[0]),
					})
				}
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
				selectedIndex={invalidSetIndex}
			>
				{(index) => {
					const set = sets[index];
					return set === undefined ? null : (
						<RollSetControl
							initialRuleIndex={index === outcomeSetIndex ? ruleIndex : undefined}
							initialWhenIndex={index === outcomeSetIndex ? whenIndex : undefined}
							index={index}
							showWeight={sets.length > 1}
							initialRollIndex={
								index === outcomeSetIndex ? outcomeRollIndex : undefined
							}
							initialOutcomeIndex={
								index === outcomeSetIndex ? outcomeIndex : undefined
							}
							value={set}
							onChangeFn={(next) =>
								onEditFn({
									type: "replace",
									index,
									value: next,
								})
							}
						/>
					);
				}}
			</EditorCollectionSelector>
		</section>
	);
};
