// import all the exports from expo-image-manipulator under the name ImgManipulator
import * as ImgManipulator from "expo-image-manipulator";

// asynchronous function that prepares image
export async function prepImg(imageUri){

    // if image Uri doesnt exist
    if(!imageUri) throw new Error("No image was provided.");

    // take image and apply some changes to it, and wait for processing to end
    const result = await ImgManipulator.manipulateAsync(
        imageUri,
        [{resize: {width:640}}],
        { base64: true,compress: 0.72, format : ImgManipulator.SaveFormat.JPEG}
    );

    // validate the Base64 result
    // if processing result does not have Base64 text,throw error message
    if(!result.base64) throw new Error("The resized image did not contain Base64 data");

    // return the prepared image details
    return {
        imageUri: result.uri,
        base64: result.base64,
        width: result.width,
        height: result.height
    };


    

}