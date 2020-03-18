var selectionRange = [], selectionSize = [], yStep, notes = {}, paintArea;
var noteList = allPitches.slice(14, 49), lens, result, cx = 3, cy = 3;
function drawLines(e) {
	e = getCursorPos(e);
	if (selectionRange.length < 2) {
		selectionRange.push([e.x, e.y]);
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
			"#00DF00", !(noteRead & 1));
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
	if (!srcEl) {
		srcEl = document.getElementById("abc");
		paintArea = document.getElementById("paintArea");
		lens = document.getElementsByClassName("img-zoom-lens")[0];
		imageZoom("zoomArea");
	}
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
	return Math.round((selectionSize[1][1] - e.y)/yStep*2) - 2;
}
var cursor;
function showPos(e) {
	e = getCursorPos(e);
	var info;
	if (!cursor) {
		cursor = document.createElementNS('http://www.w3.org/2000/svg','path');
		cursor.setAttribute('d', 'm0 0 m-8 1 h16 m-8 -3 l0 7 m5 -3 l0 -32  m-8 30 m8 1  c0 -2 -2 -3 -6 -3  -3 0 -5 2 -5 3  0 2 2 3 7 3  3 0 5 -2 4 -4');
		cursor.setAttribute("fill", "none")
		cursor.setAttribute("stroke", "red")
		paintArea.appendChild(cursor);
	}
	paintArea.firstElementChild.setAttribute('transform', 'translate(' + e.x + ',' + e.y + ')');
	if (selectionSize.length) {
		var noteRead = noteList[noteInfo(e) + 18];
		if (noteRead) {
			info = parseInt(notePos(e)/6 - selectionSize[0][0]/6) + ' ' + noteRead;
		}
	} else info = JSON.stringify([parseInt(e.x), parseInt(e.y)]);
	document.getElementById("info").innerText = info || 'Out of staff.';
}
function resetRange() {
	selectionRange = [];
	selectionSize = [];
	notes = {};
}
function notePos(e) {
	return Math.round(e.x/6)*6;
}
function getCursorPos(e) { // https://www.w3schools.com/howto/howto_js_image_magnifier_glass.asp
	var a, x = 0, y = 0;
	e = e || window.event;
	/* Get the x and y positions ofthe image: */
	a = paintArea.getBoundingClientRect();
	/* Calculate the cursor's x and y coordinates, relative to the image: */
	x = e.pageX - a.left;
	y = e.pageY - a.top;
	/* Consider any page scrolling: */
	x = x -  window.pageXOffset;
	y = y - window.pageYOffset;
	return {x : x, y : y};
}
function imageZoom(resultID) {
	var img = paintArea.previousElementSibling;
	result = document.getElementById(resultID);
	/* Set background properties for the result DIV */
	result.style.backgroundImage = "url('" + img.src + "')";
	result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
}
function moveLens() {
	var pos, x, y, e = event;
	/* Prevent any other actions that mayoccur when moving over the image */
	e.preventDefault();
	/*Get the cursor's x and y positions: */
	pos = getCursorPos(e);
	/* Calculate the position of thelens: */
	x = pos.x - 25 + 8;
	y = pos.y - 25 + 11;
//	x=980*3;y=50;
	/* Display what the lens "sees": */
	result.style.backgroundPosition = "-" + (x*cx) + "px -" + (y*cy) + "px";
}
