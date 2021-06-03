let mongoosePPM = 1.0;
var fightLength = 780;
var mongooseProcChanceMH = 0;
var mongooseProcChanceOH = 0;
let energyTick = "energyTick"
let bossHit = "bossHit"
let mhHit = "mhHit"
let ohHit = "ohHit"
let abilityHit = "abilityHit"
let procEnd = "procEnd"

class Event {
	constructor(timestamp, eventKind) {
		this.eventKind = eventKind
		this.timestamp = timestamp
	}
}

class Rogue {
	constructor(hasCrab, poolEnergy, currentAvoidance, prioMode) {
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
		this.isDead = false;
		this.prioMode = prioMode;
	}
	shouldUseAbility(time) {
		if (this.currentAvoidance > 100 && this.poolEnergy == true && energy <= 80) {
			//don't do anything
			return false;
		}
		if (this.prioMode == 1) {
			
		} else if (this.prioMode == 2) {
			
		} else if (this.prioMode == 3) {
			
		} else if (this.prioMode == 4) {
			
		}
	}
	bossHitRoll() {
		//true if we got hit, false if the boss misses
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
	var fightOver = false;
	while (events.length != 0 && fightOver == false) {
		let isOver = processNextEvent(events, player);
		fightOver = isOver;
	}
}

function processNextEvent(events, player) {
	//remove first event from front of list
	let event = events[0];
	events.splice(0,1);
	//early return if the fight is over
	if (event.timeStamp >= fightLength) {
		return true;
	}
	if (event.eventKind == energyTick) {
		//increment energy
		player.energy = Math.max(100, player.energy + 20);
		//check if we should use an ability
		let abilityEvent = player.shouldUseAbility(event.timestamp);
		if (abilityEvent != nil) {
			insertEvent(events, abilityEvent);
		}
		let tickEvent = Event(event.timestamp + 2.00, energyTick);
		insertEvent(events,tickEvent);
	} else if (event.eventKind == bossHit) {
		//check if we got hit
		let didWeGetHit = player.bossHitRoll()
		//if we got hit, check if we died
		let timeSinceLastCheatDeath = event.timestamp - player.lastCheatDeath;
		if (timeSinceLastCheatDeath <= 60) {
			//we fuckin died
			player.isDead = true;
			return true;
		} else {
			player.lastCheatDeath = event.timestamp;
		}
		//queue next boss hit
		let nextBossHitEvent = Event(event.timestamp + bossAttackSpeed, bossHit);
		insertEvent(events, nextBossHitEvent);
	} else if (event.eventKind == mhHit) {
		//check for mongoose proc, windfury proc, queue next mh hit
	} else if (event.eventKind == ohHit) {
		//check for mongoose proc, windfury proc, queue next oh hit/possible mh hit
	} else if (event.eventKind == abilityHit) {
		//check for mongoose proc, NOT windfury proc, decrement energy
	} else if (event.eventKind == End) {
		//check if we should use an ability
		let abilityEvent = player.shouldUseAbility(event.timestamp);
		if (abilityEvent != nil) {
			insertEvent(events, abilityEvent);
		}
	}
	return false;
}

function insertEvent(events, newEvent) {
	let newTime = newEvent.timestamp;
	var i = 0;
	var found = false;
	while (found == false && i < events.length) {
		let event = events[i];
		if (newTime <= event.timeStamp) {
			found = true;
		} else {
			i++;
		}
	}
	if (found == false) {
		events.push(newEvent);
	} else {
		events.splice(i,0);
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