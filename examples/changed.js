function draw() {
	var allowDragging = document.getElementById("allowDragging").checked;
	var selectAll = document.getElementById("selectAll").checked;
	var options = {
		add_classes: true,
		selectionColor: "green",
		dragColor: "blue",
		clickListener: clickListener,
		dragging: allowDragging,
		selectAll: selectAll
	};

	ABCJS.renderAbc("paper", getSrc(), options);
}

function clickListener(abcelem, tuneNumber, classes, analysis, drag) {
	if (drag) {
		selectionCallback = drag.setSelection;
		currentIndex = drag.index;
		maxIndex = drag.max;
	}
	if (abcelem.pitches && drag && drag.step && abcelem.startChar >= 0 && abcelem.endChar >= 0) {
		var originalText = getSrc().substring(abcelem.startChar, abcelem.endChar);
		var arr = tokenize(originalText);
		// arr now contains elements that are either a chord, a decoration, a note name, or anything else. It can be put back to its original string with .join("").
		for (var i = 0; i < arr.length; i++) {
			arr[i] = moveNote(arr[i], drag.step);
		}
		var newText = arr.join("");

		setSrc(getSrc().substring(0, abcelem.startChar) + newText + getSrc().substring(abcelem.endChar));
		formatAbc(abcelem.startChar, abcelem.endChar);
		draw();
	} else if (abcelem.startChar >= 0 && abcelem.endChar >= 0)
		formatAbc(abcelem.startChar, abcelem.endChar);
}
function formatAbc(start, end) {
	var abc;
	if (start < 0 || end < 0)
		abc = sanitize(getSrc());
	else {
		abc = sanitize(getSrc().substring(0, start)) +
			'<span class="select">' +
			sanitize(getSrc().substring(start, end)) +
			'</span>' +
			sanitize(getSrc().substring(end));
	}
	var el = document.getElementById("source");
	el.innerHTML = abc.replace(/\n/g,"<br>");
}
