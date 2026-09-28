// import react and helpers
import React, {useRef,useEffect} from "react";

// import app state, button and text
import { AppState,Button,Text } from "react-native";

// import safe area view
import { SafeAreaView } from "react-native-safe-area-context";

// import viro AR components
import { ViroARScene,ViroARSceneNavigator,ViroARPlaneSelector,ViroNode,ViroQuad,ViroText,ViroMaterials } from "@reactvision/react-viro";

// create card with dark background
ViroMaterials.createMaterials({ecoFactCard: {diffuseColor:"rgb(18, 61, 43)",lightingModel:"Constant"}});

// function to draw fact on surface
function FactScene({sceneNavigator}) {

    
    //  category from normal screen
    const { cat ,selector} = sceneNavigator.viroAppProps;

    // planeEvents
    const planeEvents = {

        // look for horizontal surfaces
        anchorDetectionTypes: ["PlanesHorizontal"],

        // add newly detected surface
        onAnchorFound: (anchor) => selector.current?.handleAnchorFound(anchor),

        // update newly detected surface
        onAnchorUpdated: (anchor) => selector.current?.handleAnchorUpdated(anchor),

        // remove surface
        onAnchorRemoved: (anchor) => anchor && selector.current?.handleAnchorRemoved(anchor)

    };

    //  return ar scene and card
    return(
        // AR Scene
        <ViroARScene {...planeEvents}>
            
            {/* place ar card on user tapped area */}
            <ViroARPlaneSelector ref={selector} alignment="Horizontal" hideOverlayOnSelection={true}>

                {/* Raise card and keep it facing user */}
                <ViroNode position={[0,0.35,0]} transformBehaviors={["billboard"]}>
                    
                    {/* background */}
                    <ViroQuad width={0.8} height={0.6} materials={["ecoFactCard"]}/>

                    <ViroText text={cat.name + "\n\n" +cat.fact} position={[0,0,0.01]} width={3.6} height={2.6} scale={[0.2,0.2,0.2]} textAlign="center" textAlignVertical="center" textLineBreakMode="wordwrap" textClipMode="clipToBounds" style={{fontSize:24,color:"rgb(255,255,255)"}}/>

                </ViroNode>

            </ViroARPlaneSelector>

        </ViroARScene>
    );

}

// AR fact card function
export default function ARFCard({cat,onBackBtn}){

    // selector
    const selector = useRef(null);

    // close AR when app in background
    useEffect(()=>{

        // watch whether app enters background
        const listener = AppState.addEventListener("change",(state)=>{

            // return to fact page releases AR camera
            if(state === "background") onBackBtn();

        });

        // remove listener when screen closes
        return ()=>listener.remove();

    },[onBackBtn]);

    // return card
    return(
        // safe area view
        <SafeAreaView style={{flex:1,backgroundColor:"rgb(255,255,255)"}}>

            {/* how to place card text */}
            <Text style={{padding:12,fontSize:16}}>Stay still in a safe place and slowly move phone until you can tap on a highlighed floor/table.</Text>

            {/* fill available space and put category in */}
            <ViroARSceneNavigator  style={{flex:1}} initialScene={{scene:FactScene}} viroAppProps={{cat,selector}}/>

            {/* restart detection button */}
            <Button title="Reset Placement" onPress={()=>selector.current?.reset()} color="rgb(23, 99, 63)"/>
            
            {/* return button */}
            <Button title="Back to fact" onPress={onBackBtn} color="rgb(23, 99, 63)"/>

        </SafeAreaView>
    )

}
