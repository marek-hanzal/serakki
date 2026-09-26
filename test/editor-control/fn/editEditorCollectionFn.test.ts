import { expect, it, vi } from "vitest";
import { editEditorCollectionFn } from "~/editor-control/fn/editEditorCollectionFn";

it("duplicates the selected occurrence with independent nested draft data", () => {
	const original = {
		rules: [
			{
				values: [
					1,
				],
			},
		],
	};
	const neighbor = {
		rules: [],
	};
	const values = [
		original,
		original,
		neighbor,
	];
	const duplicated = editEditorCollectionFn(values, {
		type: "duplicate",
		index: 1,
		copyFn: structuredClone,
	});

	expect(duplicated).toEqual([
		original,
		original,
		original,
		neighbor,
	]);
	expect(duplicated[0]).toBe(original);
	expect(duplicated[1]).toBe(original);
	expect(duplicated[2]).not.toBe(original);
	expect(duplicated[3]).toBe(neighbor);
	duplicated[2]!.rules[0]!.values.push(2);
	expect(original.rules[0]!.values).toEqual([
		1,
	]);
	expect(values).toHaveLength(3);
});

it("appends, replaces and removes by occurrence without changing the source collection", () => {
	const original = {
		uid: "repeated",
	};
	const added = {
		uid: "new",
	};
	const values = [
		original,
		original,
	];
	const appended = editEditorCollectionFn(values, {
		type: "append",
		value: added,
	});
	const replaced = editEditorCollectionFn(appended, {
		type: "replace",
		index: 1,
		value: added,
	});
	const removed = editEditorCollectionFn(replaced, {
		type: "remove",
		index: 2,
	});

	expect(values).toEqual([
		original,
		original,
	]);
	expect(appended).toEqual([
		original,
		original,
		added,
	]);
	expect(replaced).toEqual([
		original,
		added,
		added,
	]);
	expect(removed).toEqual([
		original,
		added,
	]);
	expect(removed[0]).toBe(original);
	expect(removed[1]).toBe(added);
});

it("ignores a stale selected index without asking the owner to copy a missing entry", () => {
	const values = [
		{
			uid: "remaining",
		},
	];
	const copyFn = vi.fn((value: { uid: string }) => structuredClone(value));
	expect(
		editEditorCollectionFn(values, {
			type: "duplicate",
			index: 1,
			copyFn,
		}),
	).toEqual(values);
	expect(
		editEditorCollectionFn(values, {
			type: "replace",
			index: 1,
			value: {
				uid: "new",
			},
		}),
	).toEqual(values);
	expect(
		editEditorCollectionFn(values, {
			type: "remove",
			index: 1,
		}),
	).toEqual(values);
	expect(copyFn).not.toHaveBeenCalled();
});

it("allows the last entry to be removed and a draft collection to be filled again", () => {
	const values = [
		{
			uid: "last",
		},
	];
	const empty = editEditorCollectionFn(values, {
		type: "remove",
		index: 0,
	});
	expect(empty).toEqual([]);
	expect(
		editEditorCollectionFn(empty, {
			type: "append",
			value: {
				uid: "first",
			},
		}),
	).toEqual([
		{
			uid: "first",
		},
	]);
	expect(values).toEqual([
		{
			uid: "last",
		},
	]);
});
