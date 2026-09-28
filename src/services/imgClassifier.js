// import mobilenet 
import * as mobilenet from "@tensorflow-models/mobilenet";

// import tensorflow.js
import * as tf from "@tensorflow/tfjs";

// import expo fetch
import {fetch as expoFetch} from "expo/fetch";

// import model resource download helper
import { downloadMResource } from "./modelDL.js";

// import Buffer
import { Buffer } from "buffer";

// import jpeg
import jpeg from "jpeg-js";

// create global model variable for the model that is fully loaded, initialise with null
let model = null;

// crete a module level variable for the model load already in progress
let modelPromise = null;

// function to reuse a loaded model, or share a current load, and reset the promise if the load fails
export async function initModel() {

    // if model exists, return model
    if(model) return model;

    // if model loading promide doesnt exist
    if(!modelPromise) {

        // create async function and store it as the shared loading promise
        modelPromise = (async () => {

            // register helpers for tf
            tf.setPlatform("sgecoquester",{
                
                // fetch
                fetch: (url,options) => downloadMResource(expoFetch,url,options),

                // time
                now: ()=> performance.now(),

                // encode
                encode: (text,encoding="utf-8") => new Uint8Array(Buffer.from(text,encoding==="utf-16"?"utf16le":encoding)),

                // decode
                decode: (bytes,encoding="utf-8") => Buffer.from(bytes).toString(encoding==="utf-16"?"utf16le":encoding),

                // check whether value is a typed numeric array
                isTypedArray: (val) => ArrayBuffer.isView(val) && !(val instanceof DataView)

            });

            // run model calculations on phone cpu
            await tf.setBackend("cpu");

            // wait intil tensorflow is ready
            await tf.ready();

            // begin loading mobile net and open config object
            model = await mobilenet.load({

                // select mobilenet ver 1
                version: 1,
                alpha:0.5

            });

            // return the loaded model from async function
            return model;

        })();

    }

    // begin a try block for waiting on the shared model loading promise.
    try{

        // wait for modelPromise and return the loaded model when it succeeds
        return await modelPromise;


    }
    // begin catch block for if loading or preperation fails
    catch(error) {

        // clears the failed promise so a future call is allowed to try loading again
        modelPromise = null;

        // throw original error
        throw error;

    }

}

// function to reuse old model when possible
export async function retryLoading() {

    // starts and returns with a fresh initialisation attempt
    return initModel();

}

// function to validate input , load the model, decode the image, request five predictions, and release the temp tensor
export async function classifyImgData(base64) {

    //  if values are not strings or if the base64 string is empty, stop with a clear error
    if (typeof base64!=="string" || !base64.length) throw new Error("The image data is missing.");

    // initialises or reuses MobileNet and stores the available model
    const loadedModel = await initModel();

    // decode base64 to jpeg bytes
    const decodedBytes = jpeg.decode(Buffer.from(base64,"base64"),{useTArray:true,formatAsRGBA:false});

    // turn the jpeg bytes into a three chanel RGB image tensor
    const imageTensor = tf.tensor3d(decodedBytes.data,[decodedBytes.height,decodedBytes.width,3],"int32");

    // begin a try block so classification is paired with guaranteed cleanup
    try{

        // ask mobilenet for top 5 predictions and return them if ready
        return await loadedModel.classify(imageTensor,5);



    }
    // run whether classification suceeds or throws error
    finally {

        // dispose the temporary image tensor
        imageTensor.dispose();

    }

}



