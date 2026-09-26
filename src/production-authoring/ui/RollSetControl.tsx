import { readEditorFormValidationErrorFn } from "~/editor-control/fn/readEditorFormValidationErrorFn";
import { EditorNumberControl } from "~/editor-control/ui/EditorValueControls";
import { useFormValidationIssues } from "~/item-authoring/ui/useFormValidationIssues";
import type { RollSetSchema } from "~/outcome/schema/RollSetSchema";
import { RollList } from "~/production-authoring/ui/RollList";
import { RulesControl } from "~/production-authoring/ui/RulesControl";
import { Mx } from "~/translation/ui/Mx";
import { useTranslator } from "~/translation/ui/useTranslator";

export const RollSetControl = ({
	initialRuleIndex,
	initialWhenIndex,
	index,
	showWeight,
	initialRollIndex,
	initialOutcomeIndex,
	onChangeFn,
	value,
}: {
	readonly index: number;
	readonly showWeight: boolean;
	readonly initialRollIndex?: number;
	readonly initialOutcomeIndex?: number;
	readonly onChangeFn: (set: RollSetSchema.Type) => void;
	readonly initialRuleIndex?: number;
	readonly initialWhenIndex?: number;
	readonly value: RollSetSchema.Type;
}) => {
	const translator = useTranslator();
	const validationIssues = useFormValidationIssues(value);
	return (
		<section className="grid gap-3">
			{showWeight ? (
				<EditorNumberControl
					description={<Mx label="Outcome set weight help" />}
					error={readEditorFormValidationErrorFn(validationIssues, "weight")}
					label={translator.textFn("Relative set weight")}
					value={value.weight}
					min={1}
					onChangeFn={(weight) =>
						onChangeFn({
							...value,
							weight,
						})
					}
				/>
			) : null}
			<RulesControl
				initialRuleIndex={initialRollIndex === undefined ? initialRuleIndex : undefined}
				initialWhenIndex={initialRollIndex === undefined ? initialWhenIndex : undefined}
				rules={value.rules}
				target="set"
				label={translator.textFn("Set rules")}
				description={<Mx label="Outcome set rules help" />}
				allowedTypes={[
					"enable",
					"disable",
				]}
				onChangeFn={(rules) =>
					onChangeFn({
						...value,
						rules: rules as RollSetSchema.Type["rules"],
					})
				}
			/>
			<RollList
				index={index}
				initialRuleIndex={initialRuleIndex}
				initialWhenIndex={initialWhenIndex}
				initialRollIndex={initialRollIndex}
				initialOutcomeIndex={initialOutcomeIndex}
				value={value}
				onChangeFn={onChangeFn}
			/>
		</section>
	);
};
