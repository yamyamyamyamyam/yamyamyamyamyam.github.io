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
		this.lastGhostly = null;
		this.hasCrab = hasCrab; 
		this.lastCrab = null;
		this.lastEvasion = null;
		this.lastCheatDeath = null;
		this.energy = 100;	
		this.lastGCD = null;
		this.lastMongooseProc = null;
		this.priorityMode = null;
		this.poolEnergy = poolEnergy;
		this.currentAvoidance = currentAvoidance;
		this.isDead = false;
		this.prioMode = prioMode;
		this.impSNDPoints = impSNDPoints;
		this.lastBladeFlurry = null;
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
		return (this.lastGhostly == null || (time - this.lastGhostly) <= 15.0);
	}
	crabIsUp(time) {
		return (this.lastCrab == null || (time - this.lastCrab) <= 180.0);
	}
	evasionIsUp(time) {
		return (this.lastEvasion == null || (time - this.lastEvasion) <= 210);
	}
	cheatDeathIsUp(time) {
		return (this.lastCheatDeath == null || (time - this.lastCheatDeath) <= 60);
	}
	bladeFlurryIsUp(time) {
		return (this.lastBladeFlurry == null || (time - this.lastBladeFlurry) <= 120);
	}
	crabCapped() {
		return ((100 - this.currentAvoidance) <= CRAB_AVOIDANCE);
	}
	mongooseProcActive(time) {
		if (this.lastMongooseProc == null) {
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
					return;
				}
			}
			if (this.energy > 80) {
				//use hemo
				return "hemo"
			} else {
				if (this.poolEnergy == true) {
					return;
					//wait
				} else {
					if (this.energy > 35) {
						return "hemo";
						//use hemo
					} else {
						return;
						//wait 
					}
				}
			}
		} else {
			if (this.prioMode == 1) {
				if (this.cheatDeathIsUp) {
					//wait
					return;
				} else {
					if (this.ghostlyIsUp) {
						return "ghostly";
					} else {
						//are we crab-capped?
						if (this.crabCapped) {
							if (this.crabIsUp) {
								return "crab";
							} else if (this.evasionIsUp) {
								return "evasion";
							} else {
								return;
							}
						} else {
							if (this.evasionIsUp) {
								return "evasion";
							} else if (this.crabIsUp) {
								return "crab";
							} else {
								return;
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
	//hasCrab, poolEnergy, currentAvoidance, prioMode, impSNDPoints, hitRating, mhSpeed, ohSpeed, hasMongoose
	let hasCrab = document.querySelector("#hasCrab");
	let poolEnergy = document.querySelector("#poolEnergy");
	let currentAvoidance = document.querySelector("#currentAvoidance");
	let prioMode = document.querySelector("#prioMode");
	let impSNDPoints = document.querySelector("#impSNDPoints");
	let hitRating = document.querySelector("#hitRating");
	let mhSpeed = document.querySelector("#mhSpeed");
	let ohSpeed = document.querySelector("#ohSpeed");
	let hasMongoose = document.querySelector("#hasMongoose");
	let player = new Rogue(hasCrab, poolEnergy, currentAvoidance, prioMode, impSNDPoints, hitRating, mhSpeed, ohSpeed, hasMongoose);
	simulateFight(player);
}

function simulateFight(player) {
	var events = [];
	//process first energy tick, boss hit, MH hit, OH hit
	events.push(new Event(0.00, energyTick));
	events.push(new Event(0.00, bossHit));
	events.push(new Event(0.00, mhHit));
	events.push(new Event(0.50, ohHit));
	var fightOver = false;
	while (fightOver == false) {
		fightOver = processNextEvent(events, player);
		console.log("processing event");
	}
	console.log("done");
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
		processMHHit(event, events, player);
		//check for mongoose proc, windfury proc, queue next mh hit
	} else if (event.eventKind == ohHit) {
		processOHHit(event, events, player);
		//check for mongoose proc, queue next oh hit
	} else if (event.eventKind == "hemo") {
		processAbilityHit(event, events, player);
	} else if (event.eventKind == "crab") {
		processCrabStart(event, events, player);
	} else if (event.eventKind == "ghostly") {
		//can proc mongoose
		processAbilityHit(event, events, player);
		processStartGhostly(event, events, player);
	} else if (event.eventKind == "evasion") {
		processEvasionStart(event, events, player);
	} else if (event.eventKind == refreshSND) {
		processRefreshSND(event, events, player);
	} else if (event.eventKind == endGhostly) {
		processEndGhostly(event, events, player);
	} else if (event.eventKind == windfuryHit) {
		processWindfuryHit(event, events, player);
	} else if (event.eventKind == endCrab) {
		processEndCrab(event, events, player);
	} else if (event.eventKind == endEvasion) {
		processEndEvasion(event, events, player);
	} else if (event.eventKind == mongooseMHFaded) {
		mongooseMHFaded(event, events, player);
	} else if (event.eventKind == mongooseOHFaded) {
		mongooseOHFaded(event, events, player);
	} else if (event.eventKind == bladeFlurryUsed) {
		processStartBladeFlurry(event, events, player);
	}
	return false;
}

function processEnergyTick(event, events, player) {
	//increment energy
	player.energy = Math.max(100, player.energy + 20);
	//check if we should use an ability
	checkForAbilityAndQueue(event, events, player);
}

function checkForAbilityAndQueue(event, events, player) {
	let abilityToUse = player.shouldUseAbility(event.timestamp);
	if (abilityToUse != null) {
		let newAbilityEvent = createAbilityEvent(abilityToUse, event.timestamp);
		insertEvent(events, newAbilityEvent);
	}
	let tickEvent = new Event(event.timestamp + 2.00, energyTick);
	insertEvent(events, tickEvent);
}


function processBossHit(event, events, player) {
	//check if we got hit
	let didWeGetHit = player.bossHitRoll();
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
	let nextBossHitEvent = new Event(event.timestamp + bossAttackSpeed, bossHit);
	insertEvent(events, nextBossHitEvent);
}

function processMHHit(event, events, player) {
	let hitSuccess = player.autoHitRoll();
	if (hitSuccess == true) {
		let didGetWindfuryProc = Math.random() > 0.2;
		if (didGetWindfuryProc) {
			windfuryProcced();
		}
		if (player.hasMongoose) {
			let didGetMongooseProc = Math.random() > player.mongooseProcChance;
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



function queueNextMHHit(event, events, player) {
	//schedule next MH hit according to player haste
	var timeUntilNextMHHit = player.mhSpeed;
	if (player.sliceAndDiceIsUp) {
		timeUntilNextMHHit = timeUntilNextMHHit / 1.3;
	}
	if (player.bladeFlurryIsUp) {
		timeUntilNextMHHit = timeUntilNextMHHit / 1.2;
	}
	let nextMHHitEvent = new Event(event.timestamp + timeUntilNextMHHit, "mhHit");
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
	let nextOHHitEvent = new Event(event.timestamp + timeUntilNextOHHit, "ohHit");
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
	let nextMHHitEvent = new Event(event.timestamp + timeUntilNextMHHit, "windfuryHit");
	insertEvent(events, nextMHHitEvent);
}

function processAbilityHit(event, events, player) {
	//check for mongoose proc, NOT windfury proc, decrement energy
	let hitSuccess = player.abilityHitRoll();
	if (hitSuccess == true) {
		if (player.hasMongoose) {
			let didGetMongooseProc = Math.random() > player.mongooseProcChance;
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
			let didGetMongooseProc = Math.random() > player.mongooseProcChance;
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
	let newRefreshEvent = new Event(nextTimestamp, "refreshSND");
}

function processStartGhostly(event, events, player) {
	player.lastGhostly = event.timestamp;
	player.currentAvoidance += 15.00;
	player.energy -= 40;
	let ghostlyFadedEvent = new Event(timestamp + 7.0, "ghostlyFaded");
	insertEvent(events, ghostlyFadedEvent);
}

function processEndGhostly(event, events, player) {
	//check if we should use an ability
	player.currentAvoidance -= 15.00;
	checkForAbilityAndQueue(event, events, player);
}

function processStartBladeFlurry(event, events, player) {
	player.lastBladeFlurry = event.timestamp;
	player.energy -= 20.00;
}

function processStartCrab(event, events, player) {
	player.lastCrab = event.timestamp;
	player.currentAvoidance += 6.22;
	let crabFadedEvent = new Event(timestamp + 20.0, "crabFaded");
	insertEvent(events, crabFadedEvent);
}

function processEndCrab(event, events, player) {
	//check if we should use an ability
	player.currentAvoidance -= 6.22;
	checkForAbilityAndQueue(event, events, player);
}

function processStartEvasion(event, events, player) {
	player.lastEvasion = event.timestamp;
	player.currentAvoidance += 50.00;
	let evasionFadedEvent = new Event(timestamp + 20.0, "evasionFaded");
	insertEvent(events, evasionFadedEvent);
}

function processEndEvasion(event, events, player) {
	//check if we should use an ability
	player.currentAvoidance -= 50.00;
	checkForAbilityAndQueue(event, events, player);
}

function mongooseOHProcced(event, events, player) {
	player.lastMongooseOHProc = event.timestamp;
	if (player.mongooseOHIsUp == false) {
		player.currentAvoidance += 6.00;
		player.mongooseOHIsUp = true;
	}
	//queue mongoose proc fading
	let mongooseOHFadedEvent = new Event(timestamp + 15.0, "mongooseOHFaded");
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

function mongooseMHProcced(event, events, player) {
	player.lastMongooseMHProc = event.timestamp;
	if (player.mongooseMHIsUp == false) {
		player.currentAvoidance += 6.00;
		player.mongooseIsUp = true;
	}
	//queue mongoose proc fading
	let mongooseFadedEvent = new Event(timestamp + 15.0, "mongooseMHFaded");
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

function createAbilityEvent(abilityString, timestamp) {
	let newAbilityEvent = new Event(timestamp, abilityString);
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