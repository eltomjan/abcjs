var selectionRange = [], selectionSize = [], yStep, notes = {}, paintArea, staffPos = {}, staffImg, lastKey;
var noteList = allPitches.slice(14, 49), lens, result, cx = 3, cy = 3;
function staffRect(e) {
	e = getCursorPos(e);
	if (selectionRange.length < 2) drawLines(e);
	else createNote(e);
}
function drawLines(e) {
	selectionRange.push([e.x + !!selectionRange.length, e.y]);
	if (selectionRange.length !== 2) return;
	selectionSize = selectionRange;
	var y = selectionRange[0][1] + 1;
	yStep = (selectionRange[1][1] - y + 1) / 4;
	y = parseInt(y - (3 * yStep));
	for (var i=-3;i<8;i++) {
		var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
		var adjY = parseInt(y);
		if (2*adjY === parseInt(2*y)) adjY += 0.5;
		setAttrs(newLine, {
			x1: selectionRange[0][0], y1: adjY,
			x2: selectionRange[1][0], y2: adjY,
			stroke: (i > -1 && i < 5)?'#FF8080':'#FFC0FF',
			'stroke-width': '1px'
		});
		paintArea.appendChild(newLine);
		y += yStep;
	}
	document.getElementById("info").innerText = JSON.stringify({
		clicks:selectionRange,
		step: yStep
	})
	document.getElementById("SideNotes").focus();
}
function createNote(e) {
	var noteRead = noteInfo(e);
	if (noteList[noteRead + 18]) {
		addNote(notePos(e), selectionRange[0][1] + 1 - parseInt(yStep*(noteRead-6)/2), document.getElementById("paintArea"),
		"#00F800", !(noteRead & 1));
		notes[notePos(e)] = noteRead;
	}
}
function keyFuncs(e) {
	var grp = ['Left', 'Up', 'Down', 'Right',
	'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'].indexOf(e.code || e.key) % 4;
	if (grp > -1 && selectionSize.length) {
		arrowsLogic(e, grp);
		return;
	} else {
		grp = parseInt(e.key);
		if (grp >= 0 && grp <= 9
		&& lastKey != 'z' && lastKey != '|') {
			var noteRead = noteList[noteInfo(staffPos) + 18];
			if (noteRead) {
				createNote(staffPos);
				if (grp == 1) sendNote(noteRead);
				else sendNote(noteRead + grp);
				staffPos.x = Math.round(staffPos.x/6)*6 + 12;
				redNotePos(staffPos);
				e.preventDefault();
			}
		}
	}
	if ((e.code || e.key).indexOf('Space') == 0) {
		sendNote(' ');
		arrowsLogic(e, 3);
	}
	if (e.key == 'Enter') {
		moveNotes();
	}
	window.status = e.key;
	lastKey = (e.altKey && e.key == 'w') ? '|' : e.key; // Alt + w => | (Czech keyboard)
}
function arrowsLogic(e, grp) {
	if ({} === staffPos) staffPos = {x: e.x, y: e.y};
	var noteRead = noteInfo(staffPos);
	switch (grp) {
		case 0: { // <-
			staffPos.x = notePos(staffPos);
			staffPos.x -= 6;
			break;
		}
		case 1: { // ^
			fixNoteY(noteRead + 1, staffPos);
			break;
		}
		case 2: { // ^
			fixNoteY(noteRead - 1, staffPos);
			break;
		}
		case 3: { // ->
			staffPos.x = notePos(staffPos);
			staffPos.x += 6;
			break;
		}
	}
	redNotePos(staffPos);
	e.preventDefault();
}
var srcEl;
function getSrc() {
	return srcEl.value;
}
function addNote(x, y, svg, col, withLine) {
	var newNote = document.createElementNS('http://www.w3.org/2000/svg','path');
	var line = withLine?'M'+(x-9.5)+' '+(y+0.5)+' H'+(x+10) + ' ':'';
	setAttrs(newNote, {
		d: line + 'M '+(x+5.5)+' '+y+' V'+(y-28),
		stroke: col,
		'stroke-width': '0.5px'
	});
	svg.appendChild(newNote);
	newNote = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
	setAttrs(newNote, {
		cx: x, cy: (y+0.5),
		rx: 6, ry: 4,
		fill: col,
		'fill-opacity': 0.9
	});
	svg.appendChild(newNote);
}
function setSrc(abcString) {
	if (!srcEl) addInit();
	if (abcString) srcEl.value = abcString;
}
function addInit() {
	window.onscroll = adjustSide;
	srcEl = document.getElementById("abc");
	paintArea = document.getElementById("paintArea");
	staffImg = paintArea.nextElementSibling;
	lens = document.getElementsByClassName("img-zoom-lens")[0];
	result = result || document.getElementById("zoomArea");
	//imageZoom();
}
function sendNotes() {
	if (Object.keys(notes).length) {
		var clickNotes = [];
		for(var p in notes) {
			clickNotes.push(noteList[notes[p] + 18]);
		}
		document.getElementById("abc").value += clickNotes.join(' ');
		notes = {};
		selectionRange = [];
		selectionSize = [];
		Editor.fireChanged();
	}
}
function sendNote(n) {
	var el = document.getElementById("SideNotes");
	el.value += n;
	el.focus();
}
function moveNotes() {
	var el = document.getElementById("SideNotes");
	document.getElementById("abc").value += el.value;
	el.value = '';
	el.focus();
	Editor.fireChanged();
}
function noteInfo(e) {
	return Math.round((selectionSize[1][1] - e.y)/yStep*2) - 2;
}
function fixNoteY(n, e) {
	e.y = selectionSize[1][1] - (n + 2)/2*yStep;
}
var cursor;
function showPos(e) {
	e = getCursorPos(e);
	var info;
	if (!cursor) {
		cursor = document.createElementNS('http://www.w3.org/2000/svg','path');
		setAttrs(cursor, {
			d: 'm-5 0.5 m-8 1 h28 m-13.5 -2.5 l0 6 m5 -2 l0 -32  m-8 30 m8 1  c0 -2 -2 -3 -6 -3  -3 0 -5 2 -5 3  0 2 2 3 7 3  3 0 5 -2 4 -4',
			fill: 'none',
			stroke: '#FF0000',
			'stroke-width': '0.5px'
		});
		paintArea.appendChild(cursor);
	}
	staffPos.x = e.x;
	staffPos.y = e.y;
	if (redNotePos(e)) return;
	if (!selectionSize.length) info = JSON.stringify([parseInt(e.x), parseInt(e.y)]);
	document.getElementById("info").innerText = info || 'Out of staff.';
}
function redNotePos(e) {
	paintArea.firstElementChild.setAttribute('transform', 'translate(' + e.x + ',' + e.y + ')');
	if (selectionSize.length) {
		var noteRead = noteList[noteInfo(e) + 18], info;
		if (noteRead) {
			info = parseInt(notePos(e)/6 - selectionSize[0][0]/6) + ' ' + noteRead;
			moveLens2(e);
		}
		document.getElementById("info").innerText = info || 'Out of staff.';
		return noteRead;
	}
}
function resetRange() {
	selectionRange = [];
	selectionSize = [];
	notes = {};
	for (var i=paintArea.childElementCount;;i--) {
		if (i < 2) break;
		paintArea.removeChild(paintArea.lastChild);
	}
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
	if (x >= staffImg.width) y = -1;
	if (y >= staffImg.height) y = -1;
	/* Consider any page scrolling: */
	x = x - window.pageXOffset;
	y = y - window.pageYOffset;
	return {x : x, y : y};
}
var imgObj;
function imageZoom() {
	/* Set background properties for the result DIV */
	result.style.backgroundImage = "url('" + staffImg.src + "')";
	result.style.backgroundSize = (imgObj.width * cx) + "px " + (imgObj.height * cy) + "px";
}
function moveLens() {
	var pos, x, y, e = event;
	/* Prevent any other actions that mayoccur when moving over the image */
	e.preventDefault();
	/*Get the cursor's x and y positions: */
	moveLens2(getCursorPos(e));
}
function moveLens2(pos) {
	/* Calculate the position of thelens: */
	x = pos.x - 25 + 9;
	y = pos.y - 25 + 10;
	/* Display what the lens "sees": */
	result.style.backgroundPosition = "-" + (x*cx) + "px -" + (y*cy-2) + "px";
}
function sideFocus() {
	document.getElementById("SideNotes").focus();
}
function setIMG(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();

		reader.onload = function (e) {
			staffImg.src = e.target.result;
			imgObj = new Image();
			imgObj.onload = imageZoom;
			imgObj.src = staffImg.src;
		};

		reader.readAsDataURL(input.files[0]);
		//input.disabled = true;
	}
}

function adjustSide() {
	result.parentNode.style.top = window.pageYOffset + 'px';
}
function setAttrs(obj, list) {
	for(var a in list) {
		obj.setAttribute(a, list[a]);
	}
}