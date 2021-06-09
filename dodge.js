let mongoosePPM = 1.0;
var fightLength = 780;
let baseMissChance = 28;
let baseEnemyDodgeChance = 5;
let energyTick = "energyTick";
let bossHit = "bossHit";
let mhHit = "mhHit";
let ohHit = "ohHit";
let abilityHit = "abilityHit";
let procEnd = "procEnd";

class Event {
	constructor(timestamp, eventKind) {
		this.eventKind = eventKind
		this.timestamp = timestamp
	}
}

class Rogue {
	constructor(hasCrab, poolEnergy, currentAvoidance, prioMode, impSNDPoints, hitRating, mhSpeed, ohSpeed, hasMongoose) {
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
		this.mongooseIsUp = false;
		this.sliceAndDiceIsUp = false;
		this.bladeFlurryIsUp = false;
		this.hasMongoose = hasMongoose;
		
		//chance for mongoose to proc
		this.mongooseProcChanceMH = mongoosePPM / (60 / mhSpeed);
		this.mongooseProcChanceOH = mongoosePPM / (60 / ohSpeed);
		
		//add up hit rating
		var hitChance = hitRating / 15.77;
		this.autoMissChance = (28 - hitChance + baseEnemyDodgeChance) / 100;
		this.abilityMissChance = Math.floor(0, (9 - hitChance)) + baseEnemyDodgeChance;
		
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
		return ((100 - this.currentAvoidance) <= CRAB_AVOIDANCE);
	}
	mongooseProcActive(time) {
		if (this.lastMongooseProc == nil) {
			return false;
		} else {
			return ((time - this.lastMongooseProc) <= 15.0);
		}
	}
	currentHaste() {
		var weaponSpeed = this.mhSpeed
		if (this.sliceAndDiceIsUp) {
			weaponSpeed = weaponSpeed / 1.3;
		}
		if (this.bladeFlurryIsUp) {
			weaponSpeed = weaponSpeed / 1.2;
		}
		return weaponSpeed;
	}
	
	shouldUseAbility(time) {
		if (this.currentAvoidance > 100) {
			//if we're capped and chilling
			//if blade flurry is up and we don't have a mongoose proc, use BF
			if (this.bladeFlurryIsUp && this.mongooseProcActive == false) {
				if (this.energy >= 25) {
					return "bladeFlurry";
				} else {
					return nil;
				}
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
		return (Math.random() > this.currentAvoidance);
	}
	autoHitRoll() {
		//true if we hit, false if we miss
		return (Math.random() > this.autoMissChance);
	}
	abilityHitRoll() {
		//true if we hit, false if we miss
		return (Math.random() > this.abilityMissChance);
	}
}

function setup() {
	mongooseProcChanceMH = mongoosePPM / (60 / mhSpeed);
	mongooseProcChanceOH = mongoosePPM / (60 / ohSpeed);
	let mhSpeedSliceAndDice = mhSpeed / 1.3;
	let ohSpeedSliceAndDice = ohSpeed / 1.3;
	let mhSpeedBladeFlurrySliceAndDice = mhSpeedSliceAndDice / 1.2;
	let ohSpeedBladeFlurrySliceAndDice = ohSpeedSliceAndDice / 1.2;
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
	while (fightOver == false) {
		fightOver = processNextEvent(events, player);
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
	if (player.isDead == true) {
		return true;
	}
	if (event.eventKind == energyTick) {
		processEnergyTick(event, events, player);
	} else if (event.eventKind == bossHit) {
		processBossHit(event, events, player);
	} else if (event.eventKind == mhHit) {
		//check for mongoose proc, windfury proc, queue next mh hit
	} else if (event.eventKind == ohHit) {
		//check for mongoose proc, queue next oh hit
	} else if (event.eventKind == abilityHit) {
		//check for mongoose proc, NOT windfury proc, decrement energy
	} else if (event.eventKind == refreshSND) {
		
	} else if (event.eventKind == endGhostly) {
		
	} else if (event.eventKind == windfuryHit) {
		
	} else if (event.eventKind == endCrab) {
		
	} else if (event.eventKind == endEvasion) {
		
	} else if (event.eventKind == mongooseMHFaded) {
		
	} else if (event.eventKind == mongooseOHFaded) {
		
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
		return;
	} else {
		player.lastCheatDeath = event.timestamp;
	}
	//queue next boss hit
	let nextBossHitEvent = Event(event.timestamp + bossAttackSpeed, bossHit);
	insertEvent(events, nextBossHitEvent);
}

function processMHHit(event, events, player) {
	let hitSuccess = player.autoHitRoll();
	if (hitSuccess == true) {
		let didGetWindfuryProc = Math.random() > 0.2
		if (didGetWindfuryProc) {
			windfuryProcced();
		}
		if (player.hasMongoose) {
			let didGetMongooseProc = Math.random() > player.mongooseProcChance
			if (didGetMongooseProc) {
				mongooseMHProcced(event, events, player);
			}
		}
	}
	queueNextMHHit();
}

function processOHHit(event, events, player) {
	let hitSuccess = player.autoHitRoll();
	if (hitSuccess == true) {
		if (player.hasMongoose) {
			let didGetMongooseProc = Math.random() > player.mongooseProcChance
			if (didGetMongooseProc) {
				mongooseOHProcced(event, events, player);
			}
		}
	}
	queueNextOHHit();
}

function mongooseMHProcced(event, events, player) {
	player.lastMongooseMHProc = event.timestamp;
	if player.mongooseIsUp == false {
		player.currentAvoidance += 6.00;
		player.mongooseIsUp = true;
	}
	//queue mongoose proc fading
	let mongooseFadedEvent = Event(timestamp + 15.0, "mongooseMHFaded");
	insertEvent(events, mongooseFadedEvent);
}

function mongooseMHFaded(event, events, player) {
	let lastMongooseTime = player.lastMongooseMHProc;
	if (event.timestamp < 15.0) {
		//we got another proc, so ignore this	
	} else {
		player.mongooseMHIsUp = false;
		player.currentavoidance -= 6.00;
	}
}

function mongooseOHProcced(event, events, player) {
	player.lastMongooseOHProc = event.timestamp;
	if player.mongooseOHIsUp == false {
		player.currentAvoidance += 6.00;
		player.mongooseOHIsUp = true;
	}
	//queue mongoose proc fading
	let mongooseOHFadedEvent = Event(timestamp + 15.0, "mongooseOHFaded");
	insertEvent(events, mongooseOHFadedEvent);
}

function mongooseOHFaded(event, events, player) {
	let lastMongooseTime = player.lastMongooseOHProc;
	if (event.timestamp < 15.0) {
		//we got another proc, so ignore this	
	} else {
		player.mongooseOHIsUp = false;
		player.currentavoidance -= 6.00;
	}
}

function queueNextMHHit(event, events, player) {
	//schedule next MH hit according to player haste
	var timeUntilNextMHHit = player.mhSpeed;
	if (player.sliceAndDiceIsUp) {
		timeUntilNextMHHit = timeUntilNextMHHit / 1.3;
	}
	if (player.bladeFlurryIsUp) {
		timeUntilNextMHHit = timeUntilNextMHHit / 1.2;
	}
	let nextMHHitEvent = Event(event.timestamp + timeUntilNextMHHit, "mhHit");
	insertEvent(events, nextMHHitEvent);
}

function queueNextOHHit(event, events, player) {
	//schedule next OH hit according to player haste
	var timeUntilNextOHHit = player.ohSpeed;
	if (player.sliceAndDiceIsUp) {
		timeUntilNextOHHit = timeUntilNextOHHit / 1.3;
	}
	if (player.bladeFlurryIsUp) {
		timeUntilNextOHHit = timeUntilNextOHHit / 1.2;
	}
	let nextOHHitEvent = Event(event.timestamp + timeUntilNextOHHit, "ohHit");
	insertEvent(events, nextOHHitEvent);
}


function windfuryProcced(event, events, player) {
	//schedule next MH hit according to player haste
	var timeUntilNextMHHit = player.mhSpeed;
	if (player.sliceAndDiceIsUp) {
		timeUntilNextMHHit = timeUntilNextMHHit / 1.3;
	}
	if (player.bladeFlurryIsUp) {
		timeUntilNextMHHit = timeUntilNextMHHit / 1.2;
	}
	let nextMHHitEvent = Event(event.timestamp + timeUntilNextMHHit, "windfuryHit");
	insertEvent(events, nextMHHitEvent);
}

function processAbilityHit(event, events, player) {
	let hitSuccess = player.abilityHitRoll();
	if (hitSuccess == true) {
		if (player.hasMongoose) {
			let didGetMongooseProc = Math.random() > player.mongooseProcChance
			if (didGetMongooseProc) {
				mongooseMHProcced(event, events, player);
			}
		}
	}
}

function processWindfuryHit(event, events, player) {
	//basically the same as processing a MH hit, but we don't queue another swing
	let hitSuccess = player.autoHitRoll();
	if (hitSuccess == true) {
		if (player.hasMongoose) {
			let didGetMongooseProc = Math.random() > player.mongooseProcChance
			if (didGetMongooseProc) {
				mongooseMHProcced(event, events, player);
			}
		}
	}
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