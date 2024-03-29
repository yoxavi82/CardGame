// This file manages the games client's logic. It's here that Socket.io connections are handled
// and functions from canvas.js are used to manage the game's visual appearance.



var socket = io();
var canPlayCard = false;

var logFull = false;
var playerPoints = [],
	opponentPoints = [];
var opponentCard, playerCard, matchWinner, matchEndReason, readyToEnd, timerInterval;


//////////  Socket Events  \\\\\\\\\\
socket.on("enter match", function () {
	enterMatch();
});

socket.on("update cards", function (cards) {
	updateCards(cards);
});

socket.on("unknown card played", function () {
	unknownCardPlayed();
});
socket.on("opponent msg", function (text) {
	opponentMsg(text);
});

socket.on("fight result", function (result) {
	displayResult(result);
});

socket.on("end match", function (winner, reason) {
	matchWinner = winner;
	matchEndReason = reason;
	readyToEnd = true;
	if (canPlayCard) {
		endMatch();
	}
});

socket.on("no rematch", function () {
	if (labels["waiting"].visiblen || labels["rematch"].visible) {
		labels["waiting"].visible = false;
		labels["rematch"].disabled = true;
		labels["rematch"].clickable = false;
		labels["rematch"].visible = true;
	}
});

//////////  Functions  \\\\\\\\\\
function enterQueue() {
	socket.emit("enter queue");
	labels["play"].visible = false;
	labels["play"].clickable = false;
	labels["searching"].visible = true;
}

function enterMatch() {
	playerPoints = [];
	opponentPoints = [];
	labels["result"].visible = false;
	labels["main menu"].visible = false;
	labels["main menu"].clickable = false;
	labels["rematch"].visible = false;
	labels["rematch"].clickable = false;
	labels["rematch"].disabled = false;
	labels["waiting"].visible = false;
	labels["timer"].text = 20;
	labels["timer"].visible = true;
	labels["yourhp"].visible = true;
	labels["opponenthp"].visible = true;
	timerInterval = setInterval(updateTimer, 1000);
	resetDots(labels["waiting"]);
	labels["searching"].visible = false;
	resetDots(labels["searching"]);
	labels["logo"].visible = false;
	displayCardSlots = true;
	document.getElementById("send").disabled = false;
	document.getElementById("emojiSelecter").disabled = false;
	document.getElementById("send").value = "";


}

function updateCards(cards) {
	for (var i = 0; i < cards.length; i++) {
		handSlots[i].card = cards[i];
	}
	canPlayCard = true;
}

function playCard(index) {
	if (canPlayCard) {
		socket.emit("play card", index);
		canPlayCard = false;
	}
}

function unknownCardPlayed() {
	opponentCard = { isUnknown: true };
}

function opponentMsg(text) {
	document.getElementById("msgHistory").innerHTML += "<li>" + text + "</li>";
	document.getElementById("msg").scrollTo(0, document.body.scrollHeight);

}

//En este método se recibe como parametro result que proviene del método processRound() de game_manager y dependiendo si el socket del ganador es igual al tuyo o no te muestra la clásica pantalla de “you win” o “you lose” si esta ha sido la ronda con la que uno de los dos ha ganado, en caso contrario se sigue a la siguiente ronda reiniciando el tiempo y actualizando las vidas.
function displayResult(result) {
	var player = undefined;
	var opponent = undefined;
	if (result.winner.socketId === socket.id) {
		player = result.winner;
		opponent = result.loser;
	} else {
		player = result.loser;
		opponent = result.winner;
	}
	playerPoints = player.points;
	opponentPoints = opponent.points;
	opponentCard = opponent.card;


	clearInterval(timerInterval);
	setTimeout(function () {
		if (readyToEnd) {
			endMatch();
		} else {
			canPlayCard = true;
			opponentCard = undefined;
			playerCard = undefined;
			labels["timer"].text = 20;
			labels["yourhp"].text = "Your hp: " + playerPoints;
			labels["opponenthp"].text = "Enemy hp: " + opponentPoints;
			timerInterval = setInterval(updateTimer, 1000);
			canPlayCard = true;
			socket.emit("request cards update");
		}
	}, (2 * 1000));
}
function youWin() {
	$.ajax({
		async: true,
		type: "GET",
		dataType: "html",
		url: "/win",
		data: { "random": Math.random() },
		success: resposta,
		timeout: 4000,
	});
	function resposta(dades) {
		$("#resultat").html(dades);
	}
}

//En caso que uno de los dos jugadores pierda todas sus vidas se acabara el juego, y el jugador ganador llama al método youWin() que le sumara una victoria a la base de datos y se mostrara la clásica pantalla de “you win” o “you lose” dependiendo si has ganado o perdido, respectivamente, junto con una opción de rematch y la opción de main menu.
//También se desactiva el chat hasta que vuelvas a unirte a otra partida.
//En caso de que la partida acabe porque uno de los dos jugadores ha abandonado se desactiva la opción de rematch.

function endMatch() {
	canPlayCard = false;
	readyToEnd = false;
	opponentCard = undefined;
	playerCard = undefined;
	displayCardSlots = false;
	if(socket.id === matchWinner) youWin();
	for (var i = 0; i < handSlots.length; i++) {
		handSlots[i].card = undefined;
	}

	if (matchEndReason === "player left") {
		var reason = ["Your opponent", "You"][+(socket.id !== matchWinner)] + " left the match";
		labels["rematch"].disabled = true;
		labels["rematch"].clickable = false;

	} else {
		var reason = ["Your opponent has", "You have"][+(socket.id === matchWinner)] + " a full set";
		labels["rematch"].clickable = true;
	}

	labels["result"].text = ["You Lose!", "You Win!"][+(socket.id === matchWinner)];
	labels["result"].visible = true;
	labels["rematch"].visible = true;
	labels["main menu"].visible = true;
	labels["main menu"].clickable = true;
	labels["timer"].visible = false;
	labels["timer"].text = 20;
	labels["yourhp"].visible = false;
	labels["yourhp"].text = "Your hp: 20";
	labels["opponenthp"].visible = false;
	labels["opponenthp"].text = "Enemy hp: 20";
	clearInterval(timerInterval);
	matchWinner = undefined;
	matchEndReason = undefined;

	document.getElementById("send").disabled = true;
	document.getElementById("emojiSelecter").disabled = true;
	document.getElementById("drawer").classList.add("hidden");
	document.getElementById("send").value = "To start chatting join a game";


}

function exitMatch() {
	playerPoints = [];
	opponentPoints = [];
	socket.emit("leave match");
	labels["result"].visible = false;
	labels["main menu"].visible = false;
	labels["main menu"].clickable = false;
	labels["rematch"].visible = false;
	labels["rematch"].clickable = false;
	labels["rematch"].disabled = false;
	labels["waiting"].visible = false;
	resetDots(labels["waiting"]);
	labels["play"].visible = true;
	labels["play"].clickable = true;
	labels["logo"].visible = true;
}

function requestRematch() {
	socket.emit("request rematch");
	labels["rematch"].visible = false;
	labels["rematch"].clickable = false;
	labels["waiting"].visible = true;
}

function animateLabels() {
	var dotLabels = [labels["waiting"], labels["searching"]];
	for (var i = 0; i < dotLabels.length; i++) {
		if (dotLabels[i].visible) {
			updateDots(dotLabels[i]);
		}
	}
}

function updateDots(label) {
	var dots = label.text.split(".").length - 1;
	var newDots = ((dots + 1) % 4);
	label.text = label.text.slice(0, -3) + Array(newDots + 1).join(".") + Array(3 - newDots + 1).join(" ");
}

function resetDots(label) {
	label.text = label.text.slice(0, -3) + "...";
}

function updateTimer() {
	labels["timer"].text -= 1;
	if (labels["timer"].text === 0) {
		canPlayCard = false;
		clearInterval(timerInterval);
	}
}

window.onload = function () {
	document.getElementById("send").disabled = true;
	document.getElementById("send").value = "To start chatting join a game";
	document.getElementById("drawer").classList.add("hidden");
	document.getElementById("send").addEventListener("keypress", function (event) {
		if (event.key === "Enter") {
			// Cancel the default action, if needed
			event.preventDefault();
			// Trigger the button element with a click

			document.getElementById("msgHistory").innerHTML += "<li><span style='color:blue;'>You:</span> " + this.value + "</li>";

			socket.emit('new msg', "" + this.value + "");
			this.value = "";
			document.getElementById("msg").scrollTo(0, document.body.scrollHeight);

		}
	});
	document.getElementById("emojiSelecter").disabled = "true";
	document.getElementById("emojiSelecter").addEventListener("click", function () {
		var emojiList = document.getElementById("drawer");
		if (emojiList.classList.contains("hidden")) {
			emojiList.classList.remove("hidden")
		} else {
			emojiList.classList.add("hidden");
		}
	});

	var emojis = document.getElementsByClassName("emoji");

	for (i = 0; i < emojis.length; i++) {
		emojis[i].addEventListener("click", function () {
			var text = "<img src='" + this.firstElementChild.src + "' >"
			document.getElementById("msgHistory").innerHTML += "<li><span style='color:blue;'>You:</span> " + text + "</li>";

			socket.emit('new msg', text);
			document.getElementById("drawer").classList.add("hidden");
		})
	}

	//document.getElementById("msg").scrollTo(0, this.scrollHeight);
};
