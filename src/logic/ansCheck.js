// import function to find category from the learning categories
import { findCat } from "../data/learningCats.js";

// import function to check the answer from predictRules.js
import { isCorrectAns } from "./predictRules.js";

// import function to update points, badges and completion records from rewardRules.js
import { finishLearningMission } from "./rewardRules.js"

// function that checks the selected category and session exists, then checks the quiz answer
// and calls reward function if correct, returns if incorrect
export function submitQuizAns(prog, catKey, ansIdx, session) {

    // find confirmed cat
    const cfrmedCat = findCat(catKey);

    // if session is missing/invalid, reject and show error message
    if(!cfrmedCat || !session || !Array.isArray(session.predictions)) throw new Error("Choose a category first.");

    // if answer is wrong, do not return points
    if(!isCorrectAns(cfrmedCat,ansIdx)) return {status:"incorrect",gainedPoints:0, progress:prog};

    // award topic once if user answers correctly
    return finishLearningMission(prog,catKey,session);

}