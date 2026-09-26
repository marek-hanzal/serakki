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
): Value[] => {
	switch (edit.type) {
		case "append":
			return [
				...values,
				edit.value,
			];
		case "duplicate":
			return values.flatMap((value, index) =>
				index === edit.index
					? [
							value,
							edit.copyFn(value),
						]
					: [
							value,
						],
			);
		case "replace":
			return values.map((value, index) => (index === edit.index ? edit.value : value));
		case "remove":
			return values.filter((_value, index) => index !== edit.index);
	}
};
