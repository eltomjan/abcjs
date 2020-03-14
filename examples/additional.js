var selectionRange = [], selectionSize = [], yStep, notes = {}, paintArea;
var noteList = allPitches.slice(14, 49);
function drawLines(e) {
	if (e.offsetX + e.offsetY < 2) return;
	if (selectionRange.length < 2) {
		selectionRange.push([e.offsetX, e.offsetY]);
		document.getElementById("paintArea");
		if (selectionRange.length === 2) {
			selectionSize = selectionRange;
			var y = selectionRange[0][1] + 1;
			yStep = (selectionRange[1][1] - y + 1) / 4;
			for (var i=0;i<5;i++) {
				var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
				newLine.setAttribute('x1', selectionRange[0][0]);
				newLine.setAttribute('y1', y+0.5);
				newLine.setAttribute('x2', selectionRange[1][0]);
				newLine.setAttribute('y2', y+0.5);
				newLine.setAttribute("stroke", "red")
				newLine.setAttribute("stroke-width", "1px")
				paintArea.appendChild(newLine);
				y += yStep;
			}
			document.getElementById("info").innerText = JSON.stringify({
				clicks:selectionRange,
				step: yStep
			})
		} else {
			for (var i=paintArea.childElementCount;;i--) {
				if (i < 2) break;
				paintArea.removeChild(paintArea.lastChild);
			}
		}
	} else {
		var noteRead = noteInfo(e);
		if (noteList[noteRead + 18]) {
			addNote(notePos(e), selectionRange[0][1] + 1 - (yStep*(noteRead-6)/2), document.getElementById("paintArea"),
			"#004F00", !(noteRead & 1));
			notes[notePos(e)] = noteRead;
		
		}
	}
}
var srcEl;
function getSrc() {
	return srcEl.value;
}
function addNote(x, y, svg, col, withLine) {
	cursor = document.createElementNS('http://www.w3.org/2000/svg','path');
	var line = withLine?'M'+(x-10)+' '+y+' H'+(x+10) + ' ':'';
	cursor.setAttribute('d', line + 'M '+(x+5.5)+' '+y+' V'+(y-28));
	cursor.setAttribute("stroke", col)
	svg.appendChild(cursor);
	cursor = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
	cursor.setAttribute('cx', x);
	cursor.setAttribute('cy', y);
	cursor.setAttribute('rx', 6);
	cursor.setAttribute('ry', 4);
	cursor.setAttribute("fill", col);
	svg.appendChild(cursor);
}
function setSrc(abcString) {
	if (!srcEl) srcEl = document.getElementById("abc");
	if (abcString) srcEl.value = abcString;
}
function sendNotes() {
	if (Object.keys(notes).length) {
		var el = document.getElementById("abc");
		for(var p in notes) {
			el.value += noteList[notes[p] + 18] + ' ';
		}
		notes = {};
		selectionRange = [];
		selectionSize = [];
		Editor.fireChanged();
	}
}
function noteInfo(e) {
	return Math.round((selectionSize[1][1] - e.offsetY)/yStep*2) - 2;
}
var cursor;
function showPos(e) {
	var info;
	if (!cursor) {
		paintArea = document.getElementById("paintArea");
		cursor = document.createElementNS('http://www.w3.org/2000/svg','path');
		cursor.setAttribute('d', 'm0 0 m-8 1 h16 m-8 -3 l0 7 m5 -3 l0 -32  m-8 30 m8 1  c0 -2 -2 -3 -6 -3  -3 0 -5 2 -5 3  0 2 2 3 7 3  3 0 5 -2 4 -4');
		cursor.setAttribute("fill", "none")
		cursor.setAttribute("stroke", "red")
		paintArea.appendChild(cursor);
	}
	paintArea.firstElementChild.setAttribute('transform', 'translate(' + e.offsetX + ',' + e.offsetY + ')');
	if (selectionSize.length) {
		var noteRead = noteList[noteInfo(e) + 18];
		if (noteRead) {
			info = parseInt(notePos(e)/6 - selectionSize[0][0]/6) + ' ' + noteRead;
		}
	} else info = JSON.stringify([parseInt(e.offsetX), parseInt(e.offsetY)]);
	document.getElementById("info").innerText = info || 'Out of staff.';
}
function resetRange() {
	selectionRange = [];
	selectionSize = [];
	notes = {};
}
function notePos(e) {
	return Math.round(e.offsetX/6)*6;
}
