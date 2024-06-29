export type TextPosition = {
	line: number;
	col: number;
};

export type TextRange = {
	start: TextPosition;
	end: TextPosition;
};

export function getTextPositionFromOffset(
	newlines: number[],
	offset: number,
): TextPosition {
	// Leftmost binary search
	let l = 0;
	let r = newlines.length - 1;
	while (l < r) {
		const m = Math.floor((l + r) / 2);
		if (newlines[m] < offset) {
			l = m + 1;
		} else {
			r = m;
		}
	}

	let prev_newline_offset = 0;
	if (l > 0) {
		prev_newline_offset = newlines[l - 1];
	}

	return {
		line: l,
		col: offset - prev_newline_offset,
	};
}
