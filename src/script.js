window.onload = () => {
	const arrow = "./src/images/arrow.png";
	const startButton = document.getElementsByClassName('start-button')[0];
	const missionControlTitle = document.getElementsByClassName('missionControl-title')[0];
	const missionControl = document.getElementsByClassName('missionControl')[0];
	const executeCommands = document.getElementsByClassName('execute')[0];
	const commands = document.getElementsByClassName("commands")[0];
	const pattern = document.getElementsByClassName('pattern')[0];
	const movements = [];

	const playground = document.createElement('div');
	const element = document.createElement('canvas');
	const leftBox = document.createElement('div');
	const rightBox = document.createElement('div');

	playground.className = "playground";
	element.id = "canvas"
	element.width = 1100;
	element.height = 900;
	element.tabIndex = '1';
	leftBox.className = "left-box";
	rightBox.className = "right-box";
	leftBox.innerHTML = "<p>Press start.</p><p>Type:</p>'F' = forward</p><p>'T' = turn</p><p>(clockwise)</p><div class='okay'>OK</div>";
	rightBox.innerHTML = "<p>Click the</p><p>check button</p><p>to run</p><p>your</p><p>commands.</p><div class='okay'>OK</div>";

	playground.append(leftBox, element, rightBox);
	document.body.insertBefore(playground, missionControlTitle);

	const canvas = element;
	const ctx = canvas.getContext('2d');

	const movingArrow = {
		x: (canvas.width / 2) - 50,
		y: 0,
		pointing: "down",
		spin: null,
		get index() {
			return [this.x + 50, this.y + 50];
		}
	}

	const canvasCoords = {
		done: false,
	};

	const image = new Image();
	image.src = arrow;
	image.onload = function () {
		ctx.drawImage(image, movingArrow.x, movingArrow.y, 100, 100);
	}

	function shakeIt(element, input) {
		if (input === 'add') {
			element.classList.add('shakeit');
		} else {
			element.classList.remove('shakeit');
		}
	}

	const directions = move => {
		if (move === "forward") {
			switch (movingArrow.pointing) {
				case "down": {
					if (movingArrow.index[1] + 100 < element.height && !canvasCoords[`${movingArrow.x + 50} ${movingArrow.y + 100}`]) {
						movingArrow.y += 100;

					} else {
						shakeIt(canvas, "add");
					}
					break;
				};
				case "top": {
					if (movingArrow.index[1] - 100 > 0 && !canvasCoords[`${movingArrow.x + 50} ${movingArrow.y}`]) {
						movingArrow.y -= 100;
					} else {
						shakeIt(canvas, "add");
					}
					break;
				};
				case "left": {
					if (movingArrow.index[0] - 100 > 0 && !canvasCoords[`${movingArrow.x} ${movingArrow.y + 50}`]) {
						movingArrow.x -= 100;
					} else {
						shakeIt(canvas, "add");
					}
					break;
				};
				default: {
					if (movingArrow.index[0] + 100 < element.width && !canvasCoords[`${movingArrow.x + 100} ${movingArrow.y + 50}`]) {
						movingArrow.x += 100;
					} else {
						shakeIt(canvas, "add");
					}
					break;
				}
			}

		} else if (move === 'turn') {
			switch (movingArrow.pointing) {
				case "down": {
					movingArrow.pointing = "left";
					movingArrow.spin = 90 * Math.PI / 180;
					break;
				};
				case "left": {
					movingArrow.pointing = "top";
					movingArrow.spin = 180 * Math.PI / 180;
					break;
				};
				case "top": {
					movingArrow.pointing = "right";
					movingArrow.spin = 270 * Math.PI / 180;
					break;
				};
				default: {
					movingArrow.pointing = "down";
					movingArrow.spin = 0;
					break;
				}
			}
		}
		ctx.translate(movingArrow.x + 50, movingArrow.y + 50);
		ctx.rotate(movingArrow.spin);
		ctx.translate(-(movingArrow.x + 50), -(movingArrow.y + 50));
		ctx.drawImage(image, movingArrow.x, movingArrow.y, 100, 100);
	}

	const addMovement = () => {
		const directions = commands.value.split('');
		directions.map(direction => movements.push(direction.toLowerCase() === 'f' ? "forward" : "turn"));
	}

	const checkPosition = (index) => {
		if (JSON.stringify(movingArrow.index) === JSON.stringify([550, 850]) && movingArrow.pointing === "down" && index === movements.length - 1) {
			document.body.classList.add("winner");
			executeCommands.setAttribute("disabled", "disabled");
			pattern.innerText = "Well done!";
		}
	}

	const executeAll = () => {
		resetStatus();
		const button = document.getElementsByClassName('execute')[0];
		button.setAttribute("disabled", "disabled");
		addMovement();
		const message = movements.map((movement, index) => { return `${index + 1}. ${movement} ` }).join('');
		pattern.append(message);
		const canvas = document.getElementById('canvas');
		let i = 0;
		let intervalId = setInterval(() => {
			shakeIt(canvas, 'remove');
			if (i > movements.length - 1) {
				clearInterval(intervalId);
				movements.length = 0;
				button.removeAttribute("disabled");
			} else {
				ctx.clearRect(0, 0, element.width, element.height);
				draw();
				ctx.save();
				directions(movements[i]);
				ctx.restore();
				checkPosition(i);
			}
			i++;
		}, 300);
	}

	function addCanvasCoords(begin, end) {

		if (begin[0] === end[0]) { //--> this means we are moving on Y axis
			if (begin[1] > end[1]) {
				for (let i = end[1]; i <= begin[1]; i++) {
					canvasCoords[`${begin[0]} ${i}`] = [begin[0], i];
				}
			} else {
				for (let i = begin[1]; i <= end[1]; i++) {
					canvasCoords[`${begin[0]} ${i}`] = [begin[0], i];
				}
			}
		} else if (begin[1] === end[1]) { //--> this means we are moving on X axis
			if (begin[0] > end[0]) {
				for (let j = end[0]; j <= begin[0]; j++) {
					canvasCoords[`${j} ${end[1]}`] = [j, end[1]];
				}
			} else {
				for (let j = begin[0]; j <= end[0]; j++) {
					canvasCoords[`${j} ${end[1]}`] = [j, end[1]];
				}
			}
		}
	}

	function draw() {

		ctx.lineWidth = 5;
		ctx.beginPath();

		// top (entrance from 500 to 600)
		ctx.moveTo(200, 100);
		ctx.lineTo(500, 100);
		canvasCoords.done === false ? addCanvasCoords([200, 100], [500, 100]) : "";
		ctx.moveTo(600, 100);
		ctx.lineTo(900, 100);
		canvasCoords.done === false ? addCanvasCoords([600, 100], [900, 100]) : "";

		// left side
		ctx.moveTo(200, 97.5);
		ctx.lineTo(200, element.height - 100);
		canvasCoords.done === false ? addCanvasCoords([200, 100], [200, element.height - 100]) : "";


		// bottom (exit from 500 to 600)
		ctx.lineTo(500, element.height - 100);
		canvasCoords.done === false ? addCanvasCoords([100, element.height - 100], [500, element.height - 100]) : "";
		ctx.moveTo(600, element.height - 100);
		ctx.lineTo(900, element.height - 100);
		canvasCoords.done === false ? addCanvasCoords([600, element.height - 100], [900, element.height - 100]) : "";
		// right side
		ctx.lineTo(900, 97.5);
		canvasCoords.done === false ? addCanvasCoords([900, element.height - 100], [900, 100]) : "";

		// inside pattern
		//// horizontal lines
		ctx.moveTo(300, 200);
		ctx.lineTo(400, 200);
		canvasCoords.done === false ? addCanvasCoords([300, 200], [400, 200]) : "";
		ctx.moveTo(700, 200);
		ctx.lineTo(900, 200);
		canvasCoords.done === false ? addCanvasCoords([700, 200], [900, 200]) : "";
		ctx.moveTo(300, 300);
		ctx.lineTo(400, 300);
		canvasCoords.done === false ? addCanvasCoords([300, 300], [400, 300]) : "";
		ctx.moveTo(500, 300);
		ctx.lineTo(800, 300);
		canvasCoords.done === false ? addCanvasCoords([500, 300], [800, 300]) : "";
		ctx.moveTo(200, 400);
		ctx.lineTo(500, 400);
		canvasCoords.done === false ? addCanvasCoords([200, 400], [500, 400]) : "";
		ctx.moveTo(600, 400);
		ctx.lineTo(900, 400);
		canvasCoords.done === false ? addCanvasCoords([600, 400], [900, 400]) : "";
		ctx.moveTo(300, 500);
		ctx.lineTo(400, 500);
		canvasCoords.done === false ? addCanvasCoords([300, 500], [400, 500]) : "";
		ctx.moveTo(500, 500);
		ctx.lineTo(600, 500);
		canvasCoords.done === false ? addCanvasCoords([500, 500], [600, 500]) : "";
		ctx.moveTo(800, 500);
		ctx.lineTo(900, 500);
		canvasCoords.done === false ? addCanvasCoords([800, 500], [900, 500]) : "";
		ctx.moveTo(300, 600);
		ctx.lineTo(400, 600);
		canvasCoords.done === false ? addCanvasCoords([300, 600], [400, 600]) : "";
		ctx.moveTo(500, 600);
		ctx.lineTo(700, 600);
		canvasCoords.done === false ? addCanvasCoords([500, 600], [700, 600]) : "";
		ctx.moveTo(400, 700);
		ctx.lineTo(600, 700);
		canvasCoords.done === false ? addCanvasCoords([400, 700], [600, 700]) : "";
		ctx.moveTo(700, 700);
		ctx.lineTo(800, 700);
		canvasCoords.done === false ? addCanvasCoords([700, 700], [800, 700]) : "";

		//// vertical lines
		ctx.moveTo(300, 297.5);
		ctx.lineTo(300, 502.5);
		canvasCoords.done === false ? addCanvasCoords([300, 300], [300, 500]) : "";
		ctx.moveTo(300, 597.5);
		ctx.lineTo(300, 700);
		canvasCoords.done === false ? addCanvasCoords([300, 600], [300, 700]) : "";
		ctx.moveTo(400, 197.5);
		ctx.lineTo(400, 302.5);
		canvasCoords.done === false ? addCanvasCoords([400, 200], [400, 300]) : "";
		ctx.moveTo(400, 497.5);
		ctx.lineTo(400, 602.5);
		canvasCoords.done === false ? addCanvasCoords([400, 500], [400, 600]) : "";
		ctx.moveTo(500, 97.5);
		ctx.lineTo(500, 200);
		canvasCoords.done === false ? addCanvasCoords([500, 100], [500, 200]) : "";
		ctx.moveTo(500, 397.5);
		ctx.lineTo(500, 502.5);
		canvasCoords.done === false ? addCanvasCoords([500, 400], [500, 500]) : "";
		ctx.moveTo(500, 397.5);
		ctx.lineTo(500, 502.5);
		canvasCoords.done === false ? addCanvasCoords([500, 400], [500, 500]) : "";
		ctx.moveTo(600, 97.5);
		ctx.lineTo(600, 200);
		canvasCoords.done === false ? addCanvasCoords([600, 100], [600, 200]) : "";
		ctx.moveTo(600, 697.5);
		ctx.lineTo(600, 802.5);
		canvasCoords.done === false ? addCanvasCoords([600, 700], [600, 800]) : "";
		ctx.moveTo(700, 400);
		ctx.lineTo(700, 702.5);
		canvasCoords.done === false ? addCanvasCoords([700, 400], [700, 700]) : "";
		ctx.moveTo(800, 297.5);
		ctx.lineTo(800, 400);
		canvasCoords.done === false ? addCanvasCoords([800, 300], [800, 400]) : "";
		ctx.moveTo(800, 497.5);
		ctx.lineTo(800, 600);
		canvasCoords.done === false ? addCanvasCoords([800, 500], [800, 600]) : "";

		// drawing
		ctx.stroke();
		canvasCoords.done === false ? canvasCoords.done = true : "";
	}

	function resetStatus() {
		if (![...document.body.classList].includes("winner")) {
			ctx.clearRect(0, 0, element.width, element.height);
			movingArrow.x = element.width / 2 - 50;
			movingArrow.y = 0;
			movingArrow.pointing = "down";
			movingArrow.spin = null;
			ctx.drawImage(image, movingArrow.x, movingArrow.y, 100, 100);
			draw();
			pattern.innerText = "";
		}
	}

	function playerReady() {
		startButton.classList.add('hide');
		missionControlTitle.classList.remove('hide');
		missionControl.classList.remove('hide');
	}

	function evaluateLetter(e) {
		const acceptedKeys = ["f", "F", "t", "T"];
		if (!acceptedKeys.includes(e.key)) {
			e.preventDefault();
		}
	}

	draw();
	commands.addEventListener('keypress', (e) => { evaluateLetter(e) })
	startButton.addEventListener('click', () => { playerReady() });
	leftBox.addEventListener('click', () => { leftBox.style.visibility = "hidden" });
	rightBox.addEventListener('click', () => { rightBox.style.visibility = "hidden" });
	executeCommands.addEventListener('click', () => { executeAll() });
};
