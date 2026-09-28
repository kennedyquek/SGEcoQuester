// import react
import React from "react";

// import Button and View from react native
import {Button,View} from "react-native";

// function to manage photo buttons
export default function PhotoBtns({disabled, onChoose}){

    // return buttons
    return <View style={{gap:14}}>

        {/* choose camera */}
        <Button title="Take a photo" onPress={() => onChoose("camera")} disabled={disabled} color="rgb(23, 99, 63)" />

        {/* choose gallery */}
        <Button title="Choose a photo" onPress={() => onChoose("gallery")} disabled={disabled} color="rgb(23, 99, 63)"/>

    </View>

}