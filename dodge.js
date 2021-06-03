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

class Rogue {
	constructor(hasCrab, poolEnergy, currentAvoidance) {
		this.lastGhostly = nil;
		this.hasCrab = hasCrab; 
		this.lastCrab = nil;
		this.lastEvasion = nil;
		this.lastCheatDeath = nil;
		this.energy = 100;	
		this.lastGCD = nil;
		this.lastMongooseProc = nil;
		this.priorityMode = nil;
		this.poolEnergy = poolEnergy;
		this.currentAvoidance = currentAvoidance;
		
	}
	shouldUseAbility(time) {
		if (this.energy >= 35) {
			
		}
	}
	bossHitRoll() {
		//returns true if we got hit, false if the boss misses
		return (Math.random() > this.currentAvoidance)
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
	let player = Rogue(true);
	var events = [];
	//process first energy tick, boss hit, MH hit, OH hit
	events.push(Event(0.00, energyTick));
	events.push(Event(0.00, bossHit));
	events.push(Event(0.00, mhHit));
	events.push(Event(0.50, ohHit));
	while (events.length != 0) {
		var eventsCopy = processNextEvent(events, player);
		events = eventsCopy;
	}
}

function processNextEvent(events, player) {
	let event = events[0];
	if (event.eventKind == energyTick) {
		//increment energy
		player.energy = Math.max(100, player.energy + 20);
		//check if we should use an ability
		let abilityEvent = player.shouldUseAbility(event.timestamp)
		let tickEvent = Event(event.timestamp + 2.00, energyTick)
	} else if (event.eventKind == bossHit) {
		let didWeGetHit = player.bossHitRoll()
		//
	} else if (event.eventKind == mhHit) {
		//check for mongoose proc, windfury proc, queue next mh hit
		
	} else if (event.eventKind == ohHit) {
		//check for mongoose proc, windfury proc, queue next oh hit/possible mh hit
	} else if (event.eventKind == abilityHit) {
		//check for mongoose proc, NOT windfury proc, decrement energy
	}
}

function testScope() {
	var list = [];
	list.push(1);
	list.push(2);
	list.push(3);
	list.push(4);
	list.push(5);
	console.log(list);
	testModifyList(list);
	console.log(list);
}

function testModifyList(list) {
	list.splice(0,1);
	list.push(8);
	console.log(list);
}