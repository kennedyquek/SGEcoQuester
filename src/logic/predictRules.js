// import appCategories
import { learningCATs } from "../data/learningCats.js";

// prediction below 25% will not produce a suggestion
export const defaultSThreshold = 0.25;

// function to label aliases
export function nameAlias(className) {

    // if class name is not a string
    if(typeof className !== "string") {

        // return empty array
        return [];

    }   
    
    // lowercase the class names, split by comma, remove surrounding spaces and remove empty labels
    return className.toLowerCase().split(',').map((alias) => alias.trim()).filter(Boolean);



}

// function to normalise predictions
export function normPredicts(predictions) {

    // if predictions is not an array
    if(!Array.isArray(predictions)) {

        // return empty array
        return [];

    }
    
    // keep value between 0 and 1
    return predictions.filter((prediction)=> prediction && typeof prediction.className === "string" && Number.isFinite(prediction.probability))
    .map((prediction) => ({className: prediction.className.trim(),probability: Math.max(0, Math.min(1,prediction.probability))})).sort((left,right) => right.probability - left.probability).slice(0,5);

}

// function to find the eco suggestion
export function findESuggest(predictions,minimumProbability = defaultSThreshold) {

    // declare safe predictions variable
    const safePredcts = normPredicts(predictions);

    // loop through safe predictions
    for(const predct of safePredcts) {

        // if prediction is weak
        if(predct.probability < minimumProbability) {

            // continue
            continue;

        }

        // prediction aliases
        const predctAliases = nameAlias(predct.className);

        // loop through categories
        for(const cat of learningCATs){

            // matched aliases variable
            const matchedAlias = predctAliases.find((alias)=>cat.aliases.includes(alias));

            // if alias matches
            if(matchedAlias) {

                // return the details
                return {
                    categoryKey:cat.key,
                    categoryName:cat.name,
                    className:predct.className,
                    matchedAlias,
                    probability:predct.probability
                };

            }

        }

    }

    // if nothing matches,return null
    return null;

}

// function to check if quiz answer is correct
export function isCorrectAns(cat,selectedIndex){

    // return whether the answer is correct or not
    return Boolean(cat) && cat.question.correctIndex === selectedIndex;
}

// function that groups scan predictions and timings
export function createScanAttempt({source, imageUri,predictions,latencyMs,createdAt = new Date().toISOString() }) {

    // safe predictions variable
    const safePredcts = normPredicts(predictions);

    return{
        id: `${createdAt}-${Math.random().toString(36).slice(2,8)}`,
        source,
        imageUri,
        predictions: safePredcts,
        suggestion: findESuggest(safePredcts),
        latencyMs: Number.isFinite(latencyMs) ? Math.max(0,Math.round(latencyMs)) : null,
        createdAt
    };

}



