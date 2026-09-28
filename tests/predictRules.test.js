// import testing tool from node
import test from "node:test";

// import assert from node
import assert from "node:assert/strict";

// import prediction functions
import { createScanAttempt,findESuggest,isCorrectAns,nameAlias,normPredicts } from "../src/logic/predictRules.js";

// import get category
import { findCat } from "../src/data/learningCats.js";

// test if function slits the comma-seperated mobilenet aliases
test("Splits comma-seperated MobileNet aliases", () => {

    // test if "water bottle, bottle" becomes ["water bottle", "bottle"]
    assert.deepEqual(nameAlias("water bottle, bottle"),["water bottle", "bottle"]);
})

// test if the category returned matches the alias
test("Finds an exact configured alias",()=>{
    // result of finding eco suggestion
    const result = findESuggest([{ className:"water bottle",probability:0.8}]);

    // check if it returns the recycle category key
    assert.equal(result.categoryKey, "recycle");
})

// test if can find a alias matching a category
test("Find a exact alias in a comma seperated label",() => {

    // result
    const result = findESuggest([{className:"pop bottle, soda bottle",probability:0.7}]);

    // check if the alias matches
    assert.equal(result.matchedAlias,"pop bottle");

});

// tests if reject predictions below 25% threshold
test("rejects predictions below the threshold", () => {

    // assert equal
    assert.equal(findESuggest([{ className:"water bottle",probability:0.249}]),null);




});

// test old substring problem
test("rejects dangerous substring collisions from the preliminary app",() => {

    // predictions
    const predcts = [
        {className:"American Alligator",probability:0.9},
        {className:"window screen",probability:0.8}
    ];

    // assert equal
    assert.equal(findESuggest(predcts),null);


});

// normalisation test
test("normalises, sorts and limits predct data", () => {

    // predictions
    const predictions = Array.from({length : 7},(_,index)=>({
        className:`label-${index}`,
        probability: index/10
    }));

    // result
    const result = normPredicts(predictions);

    // assert equal the length of results
    assert.equal(result.length,5);

    // assert equal class name
    assert.equal(result[0].className, "label-6");
    


});


// test if quiz ans is accurate
test("checks the answer", () => {

    // water cat
    const cat = findCat("water");

    // assert equal right answer
    assert.equal(isCorrectAns(cat,2),true);

    // assert equal wrong answer
    assert.equal(isCorrectAns(cat,1),false);

});

// scan session test
test("builds a scan session with suggestion and timing", () => {

    // result
    const result = createScanAttempt({
        source:"gallery",
        imageUri:"file:///photo.jpg",
        predictions: [{className:"windmill",probability: 0.7}],
        latencyMs: 123.6,
        createdAt: "2026-06-14T00:00:00.000Z"
    });

    // assert equal
    assert.equal(result.suggestion.categoryKey,"energy");
    assert.equal(result.latencyMs,124);

});