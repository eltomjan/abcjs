var Editor;
function init() {
	Editor = new ABCJS.Editor("abc", { canvas_id: "paper",
		warnings_id: "warnings",
		abcjsParams: {
			add_classes: true,
			selectionColor: "green",
			dragColor: "blue",
			clickListener: clickListener,
			dragging: allowDragging,
			selectAll: selectAll
		}
	});
	if (!srcEl) setSrc();
	formatAbc(-1,-1);
	draw();
}
