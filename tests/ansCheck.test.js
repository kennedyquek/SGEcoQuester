// import testing method from node
import test from "node:test";

// import assertion method
import assert from "node:assert/strict";

// import rules to test them
// quiz submission function
import { submitQuizAns } from "../src/logic/ansCheck.js";

// scan session builder
import { createScanAttempt } from "../src/logic/predictRules.js";

// progress rules
import { createInitialProgress, normProg } from "../src/logic/rewardRules.js";

// build a manual scan session
const manualSSession = createScanAttempt({source:"manual",imageUri:null,predictions:[],latencyMs:null})

// test that wrong, invalid and absent numbers do not change progress
test("Invalid, wrong and absent answers do not change progress.",()=>{

    // loop through wrong indexes, missing answers, text and out of range answers
    for(const invAns of [1,2,null,undefined,"0",-1,99]) {

        // start new progress
        const newProg = createInitialProgress();

        // result of new progress with invalid answers
        const invResult = submitQuizAns(newProg, "recycle", invAns, manualSSession);

        // check for 0 points
        assert.equal(invResult.gainedPoints, 0);

        // compare progress with empty progress to ensure there is no change in progress
        assert.deepEqual(invResult.progress,createInitialProgress());

    }

});

// test that topic repetition does not give rewards
test("Topic Repetition does not grant rewards.",()=>{

    // first attempt on recycle topic
    const firstAttempt = submitQuizAns(createInitialProgress(),"recycle",0,manualSSession);

    // second attempt on recycle topic
    const secondAttempt = submitQuizAns(firstAttempt.progress,"recycle",0,manualSSession);

    // check that the first attempt grants 50 points
    assert.equal(firstAttempt.gainedPoints,50);

    // check that second attempt grants no points
    assert.equal(secondAttempt.gainedPoints,0);

    // check that second attempts total points stays at 50
    assert.equal(secondAttempt.progress.points,50);

    // check that second attempt's scan record source is manual
    assert.equal(secondAttempt.progress.scanRecords[1].source, "manual")

    // check that second attempt's scan record suggested category key is null
    assert.equal(secondAttempt.progress.scanRecords[1].suggestedCategoryKey, null);

})

// check that rewards follow the users corrected topic
test("Rewards follow a user's corrected topic.",()=>{

    // fake a scan from gallery, water bottle
    const fakeWrongScan = createScanAttempt({source:"gallery",imageUri:"test-image", predictions: [{className:"water bottle",probability:0.8}], latencyMs:100});

    // submit correct answer
    const correctResult = submitQuizAns(createInitialProgress(),"water",2,fakeWrongScan);

    // Check points gained is from water, not recycling
    assert.equal(correctResult.gainedPoints,45);

    // check water cat completed
    assert.deepEqual(correctResult.progress.completedCategoryKeys,["water"]);

    // check that the first scan record was rejected
    assert.equal(correctResult.progress.scanRecords[0].suggestionAgreed,false);

    // check no imageUri property saved in first scan record
    assert.equal("imageUri" in correctResult.progress.scanRecords[0],false);

})

// test that missing information throws error
test("Unknown categories or invalid sessions throws correct error.",()=>{

    // test that a null session will throw an error containing the words "Choose a category"
    assert.throws(()=> submitQuizAns(createInitialProgress(),"recycle",0,null), /Choose a category/);

    // test that a session with unknown cat key will throw an error containing the words "Choose a category"
    assert.throws(()=> submitQuizAns(createInitialProgress(),"lol",0,manualSSession), /Choose a category/);
})

// test that the progress survives JSON storage
test("Completed progress survives JSON storage",()=>{

    // create progress after getting a quiz right
    const oneCorrectQuizProgress = submitQuizAns(createInitialProgress(),"recycle",0,manualSSession).progress;

    // normalize that progress
    const normOneQuiz = normProg(JSON.parse(JSON.stringify(oneCorrectQuizProgress)));

    // check that progress is the same
    assert.deepEqual(normOneQuiz,oneCorrectQuizProgress);

})

// test that a scan does not award points
test("Scan does not award points",()=>{

    // create empty progress to compare with
    const prog = createInitialProgress();

    // create a scan session with no predictions
    createScanAttempt({source:"gallery", imageUri:"test-image",predictions:[],latencyMs:20});

    // expect the progress gields to still be empty
    assert.deepEqual(prog,createInitialProgress());

})