// import default asyncstorage object
import AsyncStorage from "@react-native-async-storage/async-storage";

// import functions for creating initial progress and normalising the progress
import { createInitialProgress,normProg } from "../logic/rewardRules.js";

// storage key
const localSKey = "@sgecoquester/fin-progress";

// function that loads progress by reading storage and repairing the progress
// and also handles new user progress before returning the progress
export async function loadProg() {

    // ask storage for value under storage key and waits for result
    const storedVal = await AsyncStorage.getItem(localSKey);

    // if value stored under storage key doesn't exist, create new initial progress
    if(!storedVal) return createInitialProgress();

    // converts stored value back into a javascript value and normalises it,
    // returning a safe object
    return normProg(JSON.parse(storedVal));

}


// function that repairs progress, converts it to JSON text and saves it in storage
// and returns the safe progress version
export async function saveProg(progress){

    // normalise progress and store it in safeProg
    const safeProg = normProg(progress);

    // convert to JSON text and write it to storage, and wait for write to end
    await AsyncStorage.setItem(localSKey, JSON.stringify(safeProg));

    // return safe progress version
    return safeProg;


}

// function that removes the apps progress entry from async storage
export async function clearProg(){

    // remove item from async storage and wait for it to end
    await AsyncStorage.removeItem(localSKey);

}