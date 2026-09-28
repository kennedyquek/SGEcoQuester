// import the Badges and categories arrays and the findCat function
import {learningBADGES,learningCATs, findCat} from "../data/learningCats.js";

// maximum records for scans
const maxScanHistory = 20;

// function that starts new user with  with preset values
export function createInitialProgress() {

    // initial values
    return {
        version : 2,
        points : 0,
        completedCategoryKeys: [],
        badgeIds: [],
        scanRecords: []
    };

}

// function that returns keys that are valid in a category
function validCatKeys(){

    // return the valid keys
    return new Set(learningCATs.map((cat) => cat.key));

}

// function that returns badges that are valid
function validBadgeIds(completedCount) {

    // filter through learningBADGES and check to see if missions completed hit the miminum count required
    // for the badge, and then return the id
    return learningBADGES.filter((badge) => completedCount >= badge.requiredCount).map((badge) => badge.id);

}

// function to normalise progress
export function normProg(value) {

    // if value is null, or the value is not an object, or if the value is an array
    if(!value || typeof value !== "object" || Array.isArray(value)){

        // return initial pregrss values
        return createInitialProgress();
    };

    // allowed keys
    const allowedKeys = validCatKeys();

    // completed cat keys variable
    let completedCatKeys;

    // if completed category keys in the progrress object is an array
    if(Array.isArray(value.completedCategoryKeys)){

        // remove the unknown category keys,remove duplicates by converting into a set , and then convert back into an array
        completedCatKeys = [...new Set(value.completedCategoryKeys.filter((key)=>allowedKeys.has(key)))]


    }
    // else use an empty array
    else{

        // empty array
        completedCatKeys = [];
    }

    // points
    const points = completedCatKeys.reduce((total,key)=>total+findCat(key).points,0);

    // badgeids
    const badgeIds = validBadgeIds(completedCatKeys.length);

    // scan records variable
    let scanRcrds;

    // if the scanRecords in the value object is an array
    if(Array.isArray(value.scanRecords)){

        // remove records that arent  objects, and then keep newest records
        scanRcrds = value.scanRecords.filter((record) => record && typeof record === "object").slice(-maxScanHistory);

    }
    // else, scan records is empty
    else{
        scanRcrds = [];
    };

    // return the progress object that is repaired
    return {
        version: 2,
        points,
        completedCategoryKeys: completedCatKeys,
        badgeIds,
        scanRecords: scanRcrds
    };



    

    



}

// helper function to scan-summary
function summSession(session, categoryKey, outcome) {

    // return session summary
    return {

        id: session.id,
        source: session.source,
        createdAt: session.createdAt,
        latencyMs: session.latencyMs,
        selectedCategoryKey: categoryKey,
        suggestedCategoryKey: session.suggestion?.categoryKey || null,
        suggestionProbability: session.suggestion?.probability || null,
        suggestionAgreed: session.suggestion?session.suggestion.categoryKey === categoryKey : null,
        topPredictions: session.predictions.map((prediction)=>({
            className: prediction.className,
            probability:prediction.probability
        })),
        outcome

    };


}

// function that checks whether learning mission is completed
export function finishLearningMission(progressValue, categoryKey, session) {

    // progress
    const progress = normProg(progressValue);

    // get category from category key
    const category = findCat(categoryKey);
    
    // if category doesnt exist
    if(!category){
        
        // throw error
        throw new Error("Unknown category.");

    }

    // categories that are already completed
    const alreadyCompleted = progress.completedCategoryKeys.includes(categoryKey);

    // category keys of those completed
    const completedCategoryKeys = alreadyCompleted ? progress.completedCategoryKeys : [...progress.completedCategoryKeys,categoryKey];

    // badgeIds of completed
    const badgeIds = validBadgeIds(completedCategoryKeys.length);

    // new baddge ids
    const newBadgeIds = badgeIds.filter((badgeId)=>!progress.badgeIds.includes(badgeId));

    // next progress
    const nextProgress = {
        ...progress,
        points: alreadyCompleted? progress.points: progress.points + category.points,
        completedCategoryKeys,
        badgeIds,
        scanRecords: [
            ...progress.scanRecords,
            summSession(session,categoryKey,alreadyCompleted?"already-completed":"awarded")].slice(-maxScanHistory)
        
    };

    // return mission result
    return{
        status: alreadyCompleted ? "already-completed" : "awarded",
        gainedPoints:alreadyCompleted?0:category.points,
        newBadgeIds,
        progress: nextProgress
    };



}