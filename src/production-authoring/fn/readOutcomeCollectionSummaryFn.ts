import type { TemplateSchema } from "~/board-template/schema/TemplateSchema";
import type { OutcomeSchema } from "~/outcome/schema/OutcomeSchema";
import { readOutcomePresentationFn } from "~/production-authoring/fn/readOutcomePresentationFn";

/** Shared authoring labels and searchable identities for outcome sets and rolls. */
export const readOutcomeCollectionSummaryFn = ({
	outcomes,
	templates,
	readItemLabelFn,
	textFn,
}: {
	readonly outcomes: readonly OutcomeSchema.Type[];
	readonly templates: readonly TemplateSchema.Type[] | undefined;
	readonly readItemLabelFn: (itemUid: string, fallback: string) => string;
	readonly textFn: (key: string) => string;
}) => {
	const entries = outcomes.map((outcome) =>
		readOutcomePresentationFn({
			outcome,
			templates,
			readItemLabelFn,
			textFn,
		}),
	);
	return {
		label: entries.map(({ label }) => label).join(", "),
		searchTerms: entries.flatMap(({ searchTerms }) => searchTerms),
	};
};
