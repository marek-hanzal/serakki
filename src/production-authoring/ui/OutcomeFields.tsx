import { match } from "ts-pattern";

import { EditorItemReferenceControl } from "~/authoring-form/ui/EditorItemAutocompleteField";
import { SpaceDestinationControl } from "~/authoring-form/ui/SpaceDestinationControl";
import { useEditorProject } from "~/authoring-session/ui/useEditorProject";
import { readEditorFormValidationErrorFn } from "~/editor-control/fn/readEditorFormValidationErrorFn";
import { EditorNumberControl } from "~/editor-control/ui/EditorValueControls";
import { useFormValidationIssues } from "~/item-authoring/ui/useFormValidationIssues";
import type { ItemOutcomeSchema } from "~/outcome/schema/ItemOutcomeSchema";
import type { OutcomeSchema } from "~/outcome/schema/OutcomeSchema";
import type { SpaceOutcomeSchema } from "~/outcome/schema/SpaceOutcomeSchema";
import type { TemplateOutcomeSchema } from "~/outcome/schema/TemplateOutcomeSchema";
import { QuantityControl } from "~/production-authoring/ui/QuantityControl";
import { RulesControl } from "~/production-authoring/ui/RulesControl";
import { TemplateSelector } from "~/template-authoring/ui/TemplateSelector";
import { Mx } from "~/translation/ui/Mx";
import { useTranslator } from "~/translation/ui/useTranslator";
import { LinkButton } from "~/ui/ui/LinkButton";
import { SectionEnd } from "~/ui/ui/SectionEnd";

interface OutcomeFieldProps<Value extends OutcomeSchema.Type> {
	readonly onChangeFn: (outcome: OutcomeSchema.Type) => void;
	readonly value: Value;
}

const readRandomOutcomeSpaceFn = (): number => Math.floor(Math.random() * 897) + 128;

const ItemOutcomeFields = ({ onChangeFn, value }: OutcomeFieldProps<ItemOutcomeSchema.Type>) => {
	const translator = useTranslator();
	const validationIssues = useFormValidationIssues(value);
	return (
		<>
			<EditorItemReferenceControl
				error={readEditorFormValidationErrorFn(validationIssues, "itemUid")}
				label={translator.textFn("Item")}
				value={value.itemUid}
				onChangeFn={(itemUid) =>
					onChangeFn({
						...value,
						itemUid,
					})
				}
			/>
			<QuantityControl
				minimumError={readEditorFormValidationErrorFn(validationIssues, "quantity", "min")}
				maximumError={readEditorFormValidationErrorFn(validationIssues, "quantity", "max")}
				value={value.quantity}
				onChangeFn={(quantity) =>
					onChangeFn({
						...value,
						quantity,
					})
				}
			/>
		</>
	);
};

const SpaceOutcomeFields = ({ onChangeFn, value }: OutcomeFieldProps<SpaceOutcomeSchema.Type>) => {
	const translator = useTranslator();
	const validationIssues = useFormValidationIssues(value);
	if (value.space === "previous") return null;
	return (
		<SpaceDestinationControl
			kindEditable={false}
			error={readEditorFormValidationErrorFn(validationIssues, "space")}
			value={value.space}
			onChangeFn={(space) =>
				onChangeFn({
					...value,
					space,
				})
			}
			trailing={
				<LinkButton
					className="whitespace-nowrap"
					onClick={() =>
						onChangeFn({
							...value,
							space: readRandomOutcomeSpaceFn(),
						})
					}
				>
					{translator.textFn("Pick random space")}
				</LinkButton>
			}
		/>
	);
};

const TemplateOutcomeFields = ({
	onChangeFn,
	value,
}: OutcomeFieldProps<TemplateOutcomeSchema.Type>) => {
	const project = useEditorProject();
	const translator = useTranslator();
	const validationIssues = useFormValidationIssues(value);
	return (
		<div className="grid min-w-0 grid-cols-2 gap-x-[var(--ak-panel-padding)]">
			<TemplateSelector
				templates={project.config.templates ?? []}
				value={value.templateUid}
				error={readEditorFormValidationErrorFn(validationIssues, "templateUid")}
				onChangeFn={(templateUid) =>
					onChangeFn({
						...value,
						templateUid,
					})
				}
			/>
			<EditorNumberControl
				label={translator.textFn("Space")}
				description={<Mx label="Template target space help" />}
				required={false}
				min={0}
				value={value.space ?? Number.NaN}
				clearLabel={translator.textFn("Clear")}
				error={readEditorFormValidationErrorFn(validationIssues, "space")}
				onChangeFn={(space) => {
					if (Number.isNaN(space)) {
						const { space: _space, ...next } = value;
						onChangeFn(next);
						return;
					}
					onChangeFn({
						...value,
						space,
					});
				}}
			/>
		</div>
	);
};

export const OutcomeFields = ({
	initialRuleIndex,
	initialWhenIndex,
	onChangeFn,
	value,
}: {
	readonly onChangeFn: (outcome: OutcomeSchema.Type) => void;
	readonly initialRuleIndex?: number;
	readonly initialWhenIndex?: number;
	readonly value: OutcomeSchema.Type;
}) => (
	<div className="grid gap-3">
		{match(value)
			.with(
				{
					type: "item",
				},
				(outcome) => (
					<ItemOutcomeFields
						value={outcome}
						onChangeFn={onChangeFn}
					/>
				),
			)
			.with(
				{
					type: "space",
				},
				(outcome) => (
					<SpaceOutcomeFields
						value={outcome}
						onChangeFn={onChangeFn}
					/>
				),
			)
			.with(
				{
					type: "template",
				},
				(outcome) => (
					<TemplateOutcomeFields
						value={outcome}
						onChangeFn={onChangeFn}
					/>
				),
			)
			.exhaustive()}
		<SectionEnd />
		<RulesControl
			initialRuleIndex={initialRuleIndex}
			initialWhenIndex={initialWhenIndex}
			rules={value.rules}
			target="outcome"
			description={<Mx label="Outcome rules help" />}
			allowedTypes={[
				"enable",
				"disable",
			]}
			onChangeFn={(rules) =>
				onChangeFn({
					...value,
					rules: rules as OutcomeSchema.Type["rules"],
				})
			}
		/>
	</div>
);
