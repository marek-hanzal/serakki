import { match } from "ts-pattern";

import type { TemplateSchema } from "~/board-template/schema/TemplateSchema";
import type { OutcomeSchema } from "~/outcome/schema/OutcomeSchema";
import { readSpaceDestinationLabelFn } from "~/space/fn/readSpaceDestinationLabelFn";

export interface OutcomePresentation {
	readonly label: string;
	readonly searchTerms: readonly string[];
	readonly summary: string;
}

/** Owns the Editor-facing identity, search and compact summary for one authored outcome. */
export const readOutcomePresentationFn = ({
	outcome,
	templates,
	readItemLabelFn,
	textFn,
}: {
	readonly outcome: OutcomeSchema.Type;
	readonly templates: readonly TemplateSchema.Type[] | undefined;
	readonly readItemLabelFn: (itemUid: string, fallback: string) => string;
	readonly textFn: (key: string) => string;
}): OutcomePresentation => {
	const ruleLabel = outcome.rules.length === 1 ? textFn("rule") : textFn("rules");
	const ruleSummary = outcome.rules.length === 0 ? "" : ` · ${outcome.rules.length} ${ruleLabel}`;
	return match(outcome)
		.with(
			{
				type: "item",
			},
			(value) => {
				const { min, max } = value.quantity;
				const quantity = min === max ? `×${min}` : `×${min}–${max}`;
				const placement =
					value.placement === "drop" ? textFn("Local drop") : textFn("Random");
				return {
					label: readItemLabelFn(value.itemUid, textFn("No item selected")),
					searchTerms: [
						value.itemUid,
						readItemLabelFn(value.itemUid, ""),
					],
					summary: `${quantity} · ${placement}${ruleSummary}`,
				};
			},
		)
		.with(
			{
				type: "space",
			},
			(value) => {
				const label = readSpaceDestinationLabelFn(value.space, textFn, templates);
				return {
					label,
					searchTerms: [
						readSpaceDestinationLabelFn(value.space, (key) => key, templates),
						...(typeof value.space === "object"
							? [
									value.space.templateUid,
								]
							: []),
					],
					summary: `${label}${ruleSummary}`,
				};
			},
		)
		.with(
			{
				type: "template",
			},
			(value) => {
				const title = templates?.find(({ uid }) => uid === value.templateUid)?.title;
				const label = title ?? textFn("No template selected");
				const target =
					value.space === undefined ? "" : ` · ${textFn("Space")} ${value.space}`;
				return {
					label: `${label}${target}`,
					searchTerms: [
						value.templateUid,
						`Template ${title ?? value.templateUid}`,
						...(value.space === undefined
							? []
							: [
									`Space ${value.space}`,
								]),
					],
					summary: `${textFn("Template")}${target}${ruleSummary}`,
				};
			},
		)
		.exhaustive();
};
