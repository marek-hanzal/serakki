import { match } from "ts-pattern";

export namespace editEditorCollectionFn {
	export type Edit<Value> =
		| {
				readonly type: "append";
				readonly value: Value;
		  }
		| {
				readonly type: "duplicate";
				readonly index: number;
				readonly copyFn: (value: Value) => Value;
		  }
		| {
				readonly type: "replace";
				readonly index: number;
				readonly value: Value;
		  }
		| {
				readonly type: "remove";
				readonly index: number;
		  };
}

/**
 * Edits one indexed draft collection without mutating its entries. Missing indices
 * leave the collection unchanged; the owner supplies duplication/identity policy.
 * Empty results remain valid drafts, not proof of a non-empty saved contract.
 */
export const editEditorCollectionFn = <Value>(
	values: readonly Value[],
	edit: editEditorCollectionFn.Edit<NoInfer<Value>>,
): Value[] =>
	match(edit)
		.returnType<Value[]>()
		.with(
			{
				type: "append",
			},
			({ value }) => [
				...values,
				value,
			],
		)
		.with(
			{
				type: "duplicate",
			},
			({ index: selectedIndex, copyFn }) =>
				values.flatMap((value, index) =>
					index === selectedIndex
						? [
								value,
								copyFn(value),
							]
						: [
								value,
							],
				),
		)
		.with(
			{
				type: "replace",
			},
			({ index: selectedIndex, value: next }) =>
				values.map((value, index) => (index === selectedIndex ? next : value)),
		)
		.with(
			{
				type: "remove",
			},
			({ index: selectedIndex }) => values.filter((_value, index) => index !== selectedIndex),
		)
		.exhaustive();
