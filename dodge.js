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
	constructor(hasCrab, poolEnergy, currentAvoidance, prioMode, impSNDPoints) {
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
		this.impSNDPoints = impSNDPoints;
		this.lastBladeFlurry = nil;
	}
	
	ghostlyIsUp(time) {
		return (this.lastGhostly == nil || (time - this.lastGhostly) <= 15.0);
	}
	crabIsUp(time) {
		return (this.lastCrab == nil || (time - this.lastCrab) <= 180.0);
	}
	evasionIsUp(time) {
		return (this.lastEvasion == nil || (time - this.lastEvasion) <= 210);
	}
	cheatDeathIsUp(time) {
		return (this.lastCheatDeath == nil || (time - this.lastCheatDeath) <= 60);
	}
	bladeFlurryIsUp(time) {
		return (this.lastBladeFlurry == nil || (time - this.lastBladeFlurry) <= 120);
	}
	crabCapped() {
		return ((100 - this.currentAvoidance) <= CRAB_AVOIDANCE)
	}
	mongooseProcActive(time) {
		if (this.lastMongooseProc == nil) {
			return false;
		} else {
			return ((time - this.lastMongooseProc) <= 15.0);
		}
	}
	
	shouldUseAbility(time) {
		if (this.currentAvoidance > 100) {
			//if we're capped and chilling
			//if blade flurry is up and we don't have a mongoose proc, use BF
			if (this.bladeFlurryIsUp && this.mongooseProcActive == false) {
				return "bladeFlurry";
			}
			if (this.energy > 80) {
				//use hemo
				return "hemo"
			} else {
				if (this.poolEnergy == true) {
					return nil
					//wait
				} else {
					if (this.energy > 35) {
						return "hemo"
						//use hemo
					} else {
						return nil
						//wait 
					}
				}
			}
		} else {
			if (this.prioMode == 1) {
				if (this.cheatDeathIsUp) {
					//wait
					return nil
				} else {
					if (this.ghostlyIsUp) {
						return "ghostly"
					} else {
						//are we crab-capped?
						if (this.crabCapped) {
							if (this.crabIsUp) {
								return "crab"
							} else if (this.evasionIsUp) {
								return "evasion"
							} else {
								return nil
							}
						} else {
							if (this.evasionIsUp) {
								return "evasion"
							} else if (this.crabIsUp) {
								return "crab"
							} else {
								return nil
							}
						}
					}
				}
			} else if (this.prioMode == 2) {
				
			} else if (this.prioMode == 3) {
			
			} else if (this.prioMode == 4) {
			
			}
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
		processEnergyTick(event, events, player);
	} else if (event.eventKind == bossHit) {
		processBossHit(event, events, player);
	} else if (event.eventKind == mhHit) {
		//check for mongoose proc, windfury proc, queue next mh hit
	} else if (event.eventKind == ohHit) {
		//check for mongoose proc, windfury proc, queue next oh hit/possible mh hit
	} else if (event.eventKind == abilityHit) {
		//check for mongoose proc, NOT windfury proc, decrement energy
	} else if (event.eventKind == refreshSND) {
		
	} else if (event.eventKind == endProc) {
		
	}
	return false;
}

function processEnergyTick(event, events, player) {
	//increment energy
	player.energy = Math.max(100, player.energy + 20);
	//check if we should use an ability
	let abilityToUse = player.shouldUseAbility(event.timestamp);
	if abilityToUse != nil {
		let newAbilityEvent = createAbilityEvent(abilityToUse, event.timestamp);
		insertEvent(events, newAbilityEvent);
	}
	let tickEvent = Event(event.timestamp + 2.00, energyTick);
	insertEvent(events, tickEvent);
}

function processBossHit(event, events, player) {
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
}

function processMHHit(event, events, player) {
	
}

function processOHHit(event, events, player) {
	
}

function processAbilityHit(event, events, player) {
	
}

function processRefreshSND(event, events, player) {
	//refresh snd
	player.energy -= 25;
	//assume it's a 5pt snd for now...because lazy
	let nextTimestamp = event.timestamp + (21 * (1 + (.15 * player.impSNDPoints)));
	let newRefreshEvent = Event(nextTimestamp, "refreshSND");
}

function processEndProc(event, events, player) {
	//check if we should use an ability
}

function createAbilityEvent(abilityString, timestamp) {
	let newAbilityEvent = Event(timestamp + .5, abilityString);
	return newAbilityEvent;
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