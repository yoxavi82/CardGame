// This file handles all socket.io connections and manages the serverside game logic.
const fs = require('fs');


var socketio = require("socket.io");

var players = [];
var queue = [];
var matches = [];
var rematchRequests = [];
const cards = getAllCards();
//Populate Cards\\
function getAllCards() {
	deck = [];
	for (var i = 1; i < 8; i++) {
		deck.push({
			"id": i,
			"attack": i,
			"img": "card" + i + ".png"
		});
	}
	console.log(deck);
	return deck;
};

var logFull = false;
var timerDuration = 22;

updateTimers();

//////////  Socket.io  \\\\\\\\\\
module.exports.listen = function (app) {
	io = socketio.listen(app);
	io.on("connection", function (socket) {
		players.push({
			socket: socket,
			deck: undefined
		});

		socket.on("disconnect", function () {
			playerDisconnected(socket);
		});

		socket.on("enter queue", function () {
			enterQueue(socket);
		});

		socket.on("leave queue", function () {
			leaveQueue(socket);
		});

		socket.on("play card", function (index) {
			playCard(socket, index);
		});

		socket.on("leave match", function () {
			leaveMatch(socket);
		});

		socket.on("request cards update", function () {
			updateCardsRequested(socket);
		});

		socket.on("request rematch", function () {
			rematchRequested(socket);
		});
	});
	return io;
};

//////////  Functions  \\\\\\\\\\
function playerDisconnected(socket) {
	var player = findPlayerById(socket.id);
	var index = players.indexOf(player);
	if (index > -1) {
		leaveQueue(socket);
		leaveMatch(socket);
		players.splice(index, 1);
	}
}

function findPlayerById(socketId) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].socket.id === socketId) {
			return players[i];
		}
	}
	return false;
}

function enterQueue(socket) {
	var player = findPlayerById(socket.id);
	if (queue.indexOf(player) === -1) {
		queue.push(player);
		socket.emit("queue entered");
		if (queue.length >= 2) {
			createMatch([queue.shift(), queue.shift()]);
		}
	}
}

function leaveQueue(socket) {
	var player = findPlayerById(socket.id);
	var index = queue.indexOf(player);
	if (index > -1) {
		queue.splice(index, 1);
	}
	socket.emit("queue left");
}

function createMatch(participants) {
	var id = createId();
	var match = {
		matchId: id,
		players: [],
		isOver: false,
		timerActive: false,
		timer: timerDuration
	};
	for (var i = 0; i < participants.length; i++) {
		var playerObject = {
			socket: participants[i].socket,
			deck: generateDeck(),
			cards: [],
			cur: undefined,
			points: 20
		};
		dealInitialCards(playerObject);
		match.players.push(playerObject);
		participants[i].socket.emit("update cards", playerObject.cards);
		participants[i].socket.join(id);
	}
	matches.push(match);
	io.to(id).emit("enter match");
	match.timerActive = true;
}

function createId() {
	var id = "";
	var charset = "ABCDEFGHIJKLMNOPQRSTUCWXYZabcdefghijklmnopqrtsuvwxyz1234567890";
	for (var i = 0; i < 16; i++) {
		id += charset.charAt(Math.floor(Math.random() * charset.length));
	}
	return id;
}

function dealInitialCards(playerObject) {
	for (var i = 0; i < 5; i++) {
		playerObject.cards[i] = drawCard(playerObject.deck);
	}
}

function drawCard(deck) {

	return deck[Math.floor(Math.random() * deck.length)];
}

function findMatchBySocketId(socketId) {
	for (var i = 0; i < matches.length; i++) {
		for (var j = 0; j < matches[i].players.length; j++) {
			if (matches[i].players[j].socket.id === socketId) {
				return matches[i];
			}
		}
	}
	return false;
}

function playCard(socket, index) {
	var match = findMatchBySocketId(socket.id);
	if (match) {
		var player = match.players[match.players[0].socket.id === socket.id ? 0 : 1];
		if (!player.cur) {
			if (index >= 0 && index <= 4) {
				if (player.cards[index] !== undefined) {
					player.cur = player.cards[index];
					player.cards[index] = undefined;
					var opponent = match.players[match.players[0].socket.id !== socket.id ? 0 : 1];
					opponent.socket.emit("unknown card played");
					if (cursReady(match)) {
						match.timerActive = false;
						match.timer = timerDuration;
						fightCards(match);
					}
				}
			}
		}
	}
}

function cursReady(match) {
	var isReady = (match.players[0].cur && match.players[1].cur);
	return isReady;
}

function fightCards(match) {
	c0 = match.players[0].cur;
	c1 = match.players[1].cur;

	processRound(match, c0.attack=== c1.attack, match.players[c0.attack > c1.attack ? 0 : 1], c0.attack - c1.attack);

}
function processRound(match, tied, winner, dif) {

	var loser = match.players[match.players[0] !== winner ? 0 : 1];

	if (!tied) {
		if (dif < 0) dif = dif * -1;
		console.log(loser.points);
		console.log(dif);
		
		loser.points -= dif;

	} else {
		
		winner = match.players[0];
		loser= match.players[1];
	}

	console.log(winner.points);

	console.log(loser.points);



		var data = {
			winner: {
				socketId: winner.socket.id,
				card: winner.cur,
				points: winner.points
			},
			loser: {
				socketId: loser.socket.id,
				card: loser.cur,
				points: loser.points
			}
		};
		io.to(match.matchId).emit("fight result", data);
		if (checkForSet(loser)) {
			endMatch(match, winner, "set");
		} else {
			nextRound(match);
		}
	
}

function nextRound(match) {
	for (var i = 0; i < match.players.length; i++) {
		match.players[i].cur = undefined;
		for (var j = 0; j < match.players[i].cards.length; j++) {
			if (match.players[i].cards[j] === undefined) {

				match.players[i].cards[j] = drawCard(match.players[i].deck);
			}
		}
	}
}

function checkForSet(player) {

	return player.points <= 0;
}

function leaveMatch(socket) {
	var match = findMatchBySocketId(socket.id);
	if (match) {
		if (!match.isOver) {
			var winner = match.players[match.players[0].socket.id !== socket.id ? 0 : 1];
			endMatch(match, winner, "player left");
		} else {
			io.to(match.matchId).emit("no rematch");
		}
		removeMatch(match);
	}
}

function endMatch(match, winner, reason) {
	io.to(match.matchId).emit("end match", winner.socket.id, reason);
	match.isOver = true;
	match.timer = timerDuration;
	match.timerActive = false;
}

function removeMatch(match) {
	var index = matches.indexOf(match);
	if (index > -1) {
		matches.splice(index, 1);
	}
}

function generateDeck() {


	// Shuffle array
	deck = [];
	deck = cards.sort(() => 0.5 - Math.random());


	// Get sub-array of first n elements after shuffled
	return deck;

}

function updateCardsRequested(socket) {
	var match = findMatchBySocketId(socket.id);
	if (match) {
		var player = match.players[match.players[0].socket.id === socket.id ? 0 : 1];
		player.socket.emit("update cards", player.cards);
		match.timerActive = true;
	}
}

function rematchRequested(socket) {
	var match = findMatchBySocketId(socket.id);
	if (match) {
		var players = match.players;
		if (match.rematch !== undefined && match.rematch !== socket.id) {
			removeMatch(match);
			createMatch(players);
		} else {
			match.rematch = socket.id;
		}
	}
}

function updateTimers() {
	for (var i = 0; i < matches.length; i++) {
		if (matches[i].timerActive) {
			matches[i].timer -= 1;
			if (matches[i].timer === 0) {
				timesup(matches[i]);
			}
		}
	}
	setTimeout(updateTimers, 1000);
}

function timesup(match) {
	
	match.timerActive = false;
	match.timer = timerDuration;
	if (match.players[0].cur) {
		if (match.players[1].cur) {
			fightCards(match);
		} else {
			processRound(match, false, match.players[0],match.players[0].cur.attack);
		}
	} else {
		if (match.players[1].cur) {
			processRound(match, false, match.players[1],match.players[1].cur.attack);
		} else {
			processRound(match, true, match.players[0],0);
		}
	}
}
