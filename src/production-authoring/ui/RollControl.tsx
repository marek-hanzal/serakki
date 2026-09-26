import { readEditorFormValidationErrorFn } from "~/editor-control/fn/readEditorFormValidationErrorFn";
import { EditorNumberControl } from "~/editor-control/ui/EditorValueControls";
import { useFormValidationIssues } from "~/item-authoring/ui/useFormValidationIssues";
import type { RollSchema } from "~/outcome/schema/RollSchema";
import { type DraftRoll } from "~/production-authoring/fn/readDraftRollOutcomesFn";
import { OutcomeList } from "~/production-authoring/ui/OutcomeList";
import { Mx } from "~/translation/ui/Mx";
import { useTranslator } from "~/translation/ui/useTranslator";

const readChancePercentFn = (chance: number) => Number((chance * 100).toFixed(6));
const readChanceFn = (chancePercent: number) => Math.round(chancePercent) / 100;

export const RollControl = ({
	initialRuleIndex,
	initialWhenIndex,
	initialOutcomeIndex,
	onChangeFn,
	value,
}: {
	readonly initialOutcomeIndex?: number;
	readonly onChangeFn: (roll: RollSchema.Type) => void;
	readonly initialRuleIndex?: number;
	readonly initialWhenIndex?: number;
	readonly value: DraftRoll;
}) => {
	const validationIssues = useFormValidationIssues(value);
	const translator = useTranslator();
	if (value.type === undefined) return null;
	const roll = value as RollSchema.Type;
	return (
		<div className="grid gap-4">
			{roll.type === "chance" ? (
				<EditorNumberControl
					error={readEditorFormValidationErrorFn(validationIssues, "chance")}
					description={<Mx label="Chance percentage help" />}
					label={translator.textFn("Chance (%)")}
					value={readChancePercentFn(roll.chance)}
					min={0}
					max={100}
					step={5}
					onChangeFn={(chancePercent) =>
						onChangeFn({
							...roll,
							chance: readChanceFn(chancePercent),
						})
					}
				/>
			) : null}
			<OutcomeList
				initialRuleIndex={initialRuleIndex}
				initialWhenIndex={initialWhenIndex}
				value={roll.outcome}
				initialOutcomeIndex={initialOutcomeIndex}
				onChangeFn={(outcome) =>
					onChangeFn({
						...roll,
						outcome: outcome as typeof roll.outcome,
					})
				}
			/>
		</div>
	);
};
