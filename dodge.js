let mongoosePPM = 1.0;
var fightLength = 780;
var mongooseProcChanceMH = 0;
var mongooseProcChanceOH = 0;
let energyTick = "energyTick"
let bossHit = "bossHit"
let mhHit = "mhHit"
let ohHit = "ohHit"
let abilityHit = "abilityHit"

class Event {
	constructor(timestamp, eventKind) {
		this.eventKind = eventKind
		this.timestamp = timestamp
	}
}

function setup() {
	mongooseProcChanceMH = mongoosePPM / (60 / mhSpeed);
	mongooseProcChanceOH = mongoosePPM / (60 / ohSpeed);
	let mhSpeedSliceAndDice = mhSpeed / 1.3;
	let ohSpeedSliceAndDice = ohSpeed / 1.3;
	let mhSpeedBladeFlurrySliceAndDice = mhSpeedSliceAndDice / 1.2;
	let ohSpeedBladeFlurrySliceAndDice = ohSpeedSliceAndDice / 1.2;
	let baseMHAttacks = fightLength / mhSpeedBladeFlurrySliceAndDice;
	let maxOHAttacks = fightLength / ohSpeedBladeFlurrySliceAndDice;
	let maxMHAttacks = baseMHAttacks * 1.2
}

function simulateFight() {
	var energy = 100;
	var events = [];
	//process first energy tick, boss hit, MH hit, OH hit
	events.push(Event(0.00, energyTick));
	events.push(Event(0.00, bossHit));
	events.push(Event(0.00, mhHit));
	events.push(Event(0.50, ohHit));
	while (events.length != 0) {
		processNextEvent
		events = eventsCopy;
	}
}

function testScope() {
	var list = [];
	list.push(1);
	list.push(2);
	list.push(3);
	list.push(4);
	list.push(5);
	while (list.length != 0) {
		list.push(6969);
		list.splice(1,2);
		console.log(list)
	}
	console.log("b")
}