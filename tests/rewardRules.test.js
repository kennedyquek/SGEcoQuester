// import test function from node
import test from "node:test";

// import assertion tools from node(assists with comparing results)
import assert from "node:assert/strict";

// import functions from progress rules file
import { finishLearningMission,createInitialProgress,normProg } from "../src/logic/rewardRules.js";
import { create } from "node:domain";

// helper function to create a reusable fake-scan session
function fakeSession(index = 1) {

    // createdAt to read system time
    const createdAt = new Date().toISOString();

    // return session object
    return {
        id: `scan-${index}`,
        source: "gallery",
        createdAt: createdAt,
        latencyMs: 400,
        suggestion: null,
        predictions: [],

    };

}

// test that on completing a mission, result status is valid, 
// points awarded are the exact and saved total is exact
test("Category is properly awarded on completion of mission.", () => {

    // stores result of completing a "recycle" mission
    const result = finishLearningMission(createInitialProgress(), "recycle", fakeSession());

    // check that status of result is awarded
    assert.equal(result.status, "awarded");

    // check that exactly 50 points is awarded
    assert.equal(result.gainedPoints, 50);

    // check that the saved total points is exactly 50
    assert.equal(result.progress.points, 50);

});

// test that on multiple completions of the same mission,
// the points are only awarded on the first completion
// and a record is kept on the mission completion count
test("Only first completion of a mission is awarded, but record is kept on number of completions.",() => {

    // simulated first completion of "recycle" mission
    const firstComp = finishLearningMission(createInitialProgress(), "recycle", fakeSession(1));

    // simulated second completion of "recycle" mission
    const secondComp = finishLearningMission(firstComp.progress, "recycle", fakeSession(2));

    // check that the status of second completion is  already completed
    assert.equal(secondComp.status,"already-completed");

    // check that the points gained from second completion is 0
    assert.equal(secondComp.gainedPoints,0);

    // check that the total points gained upon second completion remains 50
    assert.equal(secondComp.progress.points,50);

    // check that upon second completion , there is 2 scaan records
    assert.equal(secondComp.progress.scanRecords.length,2);

});

// test that upon 1,2 and 4 completions of missions,
// that badges are unlocked on each milestone
test("Badges are awarded on 1,2 and 4 completions of missions.",() => {

    // create starting progress
    let progress = createInitialProgress()

    // loop over 4 category keys
    // entries() gives each key an index in an index-key pair
    for(const [index,key] of ["recycle","greenery","water","energy"].entries()) {

        // replace progress with updated progress returned by function upon mission completion
        progress = finishLearningMission(progress,key,fakeSession(index+1)).progress;


    } 

    // check if the 3 badges are awarded
    assert.deepEqual(progress.badgeIds,["first-learning-mission","eco-reviewer","eco-explorer"]);

});

// test that unsafe saved progress is successfully normalised
test("Unsafe saved progress is successfully normalised",() => {

    // calls normProg for unsafe fake progress
    const result = normProg({
        points:999,
        completedCategoryKeys:["fake","water","water"],
        badgeIds: ["fake-badge"],
        scanRecords: []
    });

    // check that the poibnts are recalculated to 45
    assert.equal(result.points,45)

    // check if the fake category key was removed and duplicate water key was reduced to 1
    assert.deepEqual(result.completedCategoryKeys,["water"]);

    // check if the fake badge id was removed and the first badge was awarded due to completion of 1 mission
    assert.deepEqual(result.badgeIds,["first-learning-mission"]);

});

// test the scan history can only keep a maximum of 20 latest records
test("Only 20 latest scan records are kept.",() => {

    // fake saved progress object
    const fakeSavedProgress = {
        completedCategoryKeys:[],
        badgeIds: ["fake-badge"],
        scanRecords: Array.from({length:25},(_,index)=>({id: `old-${index}`}))
    };

    // normalise the fake saved progress
    const result = normProg(fakeSavedProgress);

    // check that only 20 records remain
    assert.equal(result.scanRecords.length,20)

    // check that "old-5" record is first, meaning that the first 5 records were removed
    assert.equal(result.scanRecords[0].id,"old-5");
});

// tests that an unknown category key would throw an error
test("Unknown categories would cause an error.",() => {

    // check if an error is returned
    assert.throws(() => {

        // try to complete unknown category
        finishLearningMission(createInitialProgress(), "unknown", fakeSession());
    },/Unknown category/);//check that the error message contains the the words Unknown Category



});


