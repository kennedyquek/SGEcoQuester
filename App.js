// import react, and tools from react
import React, {useEffect,useRef,useState} from "react";

// import controls used by manual learning screens
import { ActivityIndicator,Alert,Button,Image,Linking,ScrollView,StyleSheet,Text,View } from "react-native";

// import safe area controls
import { SafeAreaProvider,SafeAreaView } from "react-native-safe-area-context";

// import status bar
import { StatusBar } from "expo-status-bar";

// import categories, badges and findCat from categories
import {learningBADGES,learningCATs,findCat} from "./src/data/learningCats.js";

// import createScanAttempt from prediction Rules
import {createScanAttempt} from "./src/logic/predictRules.js";

// import createInitialProgress from progress rules
import {createInitialProgress} from "./src/logic/rewardRules.js";

// import submitQuizAns from learning rules
import {submitQuizAns} from "./src/logic/ansCheck.js";

// import clear, load and save progress from progress Storage
import {clearProg,loadProg,saveProg} from "./src/storage/progressHelp.js";

// import image picker
import * as ImagePicker from "expo-image-picker";

// import prepImg
import { prepImg } from "./src/services/imgPrep.js";

// import classifyImgData
import { classifyImgData } from "./src/services/imgClassifier.js";

// import photo buttons component
import PhotoBtns  from "./src/components/photoBtns.js";

// import AR Fact card
import ARFCard from "./src/screens/ARFactcard.js";

// main App function
export default function App(){

    // Wrap SGEcoquester in safe area
    return <SafeAreaProvider><SGEcoQuester/></SafeAreaProvider>

}

// function to manage SGEcoQuester App's screens and actions
function SGEcoQuester(){

    // current screen and setter
    const [currScreen, setScreen] = useState("home");

    // starting progress, setCurrProg replaces it
    const [prog, setCurrProg] = useState(createInitialProgress);

    // whether progress is ready
    const [progRdy, setProgState] = useState(false);

    // current session
    const [currSession, setCurrSession] = useState(null);

    // category key
    const [catKey, setCatKey] = useState(null);

    // answer index
    const [ansIdx, setAnsIdx] = useState(null);

    // on screen message
    const [osMsg, setOSMsg] = useState("");

    // current task message
    const [busyMsg,setBusyMsg] = useState("");

    // latest result of answer and reward
    const [latestResult, setLatestResult] = useState(null);

    // prevent repeated taps from starting overlapping actions
    const actnLocked = useRef(false)

    // track whether component is still open
    const compMounted = useRef(true);

    // find the topic using catKey
    const cat = findCat(catKey);

    // load saved progress on mount
    useEffect(()=>{

        // mark component as true
        compMounted.current = true;

        // restore saved progress
        restoreProg();

        // set mounted screen to false on return
        return () => { compMounted.current = false;}; 

    },[]);

    // function to restore saved progress
    async function restoreProg(){

        // if another action holds the lock, return
        if(actnLocked.current) return;

        // set lock to true to reject the extra taps immediatelt
        actnLocked.current = true;

        // show loading message, mark app as busy
        setBusyMsg("Loading Saved Progress...");

        // clear old error by setting message to empty string
        setOSMsg("");

        // try loading
        try {

            // await loadprogress to retutn saved data
            const saved = await loadProg();

            // if component closed, return
            if(!compMounted.current) return;

            // replace the displayed progress with saved data
            setCurrProg(saved);

            // set prog state as ready(true)
            setProgState(true);
        
        // prevent crashes by catching error
        } catch (error) {

            // explain loading failure if component is open
            if (compMounted.current) setOSMsg("Saved progress could not be loaded. Please retry or reset progress.")
        
        // run this after try or catch block
        } finally {

            // set action locked to false to allow other actions to start
            actnLocked.current = false;

            // if mounted screen is still open,set busy message to empty to hide indicator
            if(compMounted.current) setBusyMsg("");

        }

    };

    // function to select image
    async function selectImg(source){

        // if action running or saved progress not loaded return
        if(actnLocked.current || !progRdy) return;

        // lock action
        actnLocked.current = true;

        // set on screen message to empty
        setOSMsg("");

        // show opening message and mark app busy
        setBusyMsg("Opening the photo...");

    // try block
    try{

        // selected photo's location
        let imgUri;

        // ask camera permission for camera source
        if(source === "camera") {

            // request and wait for camera permisiion
            const camPermission = await ImagePicker.requestCameraPermissionsAsync();

            // if camera permission denied throw error
            if(!camPermission.granted) throw new Error("Camera Permission was not granted.Please enable in settings.");

        }

        // image options
        const imgOptions = {mediaTypes:["images"],allowsEditing:false,quality:0.8 };

        // camera or gallery picked
        const picked = source === "camera" ? await ImagePicker.launchCameraAsync(imgOptions) : await ImagePicker.launchImageLibraryAsync(imgOptions);

        // if picker cancelled or component closed return
        if (picked.canceled || !compMounted.current) return;

        // read first selected photo's location
        imgUri = picked.assets[0].uri;


        // show image recognition message
        setBusyMsg("Recognising Photo...");

        // wait for next timer turn
        await new Promise((resolve) => setTimeout(resolve,0));

        // record start time
        const startedAt = performance.now();

        // prepared image, wait for result
        const prepedImg = await prepImg(imgUri);

        // classified image data
        const predictions = await classifyImgData(prepedImg.base64);

        // if component closed, return
        if(!compMounted.current) return;

        // build next session
        const nextSess = createScanAttempt({source,imageUri:prepedImg.imageUri,predictions,latencyMs:performance.now()-startedAt});

        // store new session
        setCurrSession(nextSess);

        // switch screen to review
        setScreen("review");

    // catch error
    } catch(error) {

        // show error message
        if(compMounted.current) setOSMsg(`${error.message || "Image Recognition failed."} Try again, or learn without scanning below.`);
    
    // what happens after try or catch block
    } finally {



        // remove action lock
        actnLocked.current = false;

        // hide spinner
        if(compMounted.current) setBusyMsg("");

    }

    }

    // function to start manual selection of learning topic
    function manualTopic(key) {

        // if another action is running or progress is not ready, return
        if(actnLocked.current || !progRdy) return;

        // build and set a manual scan session with no image and predictions
        setCurrSession(createScanAttempt({source:"manual",imageUri:null,predictions:[],latencyMs:null}));

        // confirm a category
        confirmCat(key);

    }

    // function to confirm category
    function confirmCat(key) {

        // look up key and stop if no matching topic key exist
        if(!findCat(key)) return;

        // save category
        setCatKey(key);

        // set answer index as null so that no quiz option is selected for this topic
        setAnsIdx(null);

        // clear previous on screen message with empty string
        setOSMsg("");

        // set screen to fact screen
        setScreen("fact");

    }

    // function to open selected quiz
    function openSelectedQuiz(key) {

        // clear previous answer selection
        setAnsIdx(null);

        // use empty string to remove old screen message
        setOSMsg("");

        // switch screen to quiz to show topic's question and answer buttons
        setScreen("quiz");

    }

    // function to check answer and save progress
    async function checkQuizAns() {

        // if action happening, no answer selected, or progress not loaded, return
        if(actnLocked.current || ansIdx === null || !progRdy) return;

        // lock actions immediately
        actnLocked.current = true;

        // try block
        try{

            // get next result
            const nextResult = submitQuizAns(prog,catKey,ansIdx,currSession);

            // if result is incorrect
            if(nextResult.status === "incorrect") {

                // insert topic's fact into retry message
                setOSMsg(`Incorrect. ${cat.fact} Please Try Again.`);

                // end attempt
                return;

            }

            // show saving message
            setBusyMsg("Saving Progress...");

            // wait until result progress is saved
            const savedProg = await saveProg(nextResult.progress);

            // return if component closed during wait
            if(!compMounted.current) return;

            // replace displayed progress with saved result
            setCurrProg(savedProg);

            // keep answer result and gained points for completion screen
            setLatestResult(nextResult);

            // clear message
            setOSMsg("");

            // switch to result screen
            setScreen("result");
        
        // handle crashes
        } catch(error) {

            // if screen is still open,ask user to retry without displaying unsaved points
            if(compMounted.current) setOSMsg("Progress could not be saved. Please try to submit again.");
        
        // what happens after try or catch block
        } finally {

            // set action locked to false
            actnLocked.current = false;

            // if screen still open, clear busy message
            if(compMounted.current) setBusyMsg("");
        }


    }

    // ask permission to reset progress
    function askReset(){

        // stop if another action using progress data
        if(actnLocked.current) return;



        // show alert
        Alert.alert("Reset Progress?","Points, badges and learning records will be reset.",[

            // add cancel button
            {text:"Cancel",style:"cancel"},

            // add reset button
            {text:"Reset", style:"destructive",onPress: resetProg}

        ]);

    } 

    // function to reset progress
    async function resetProg(){

        // stop if another action already holds lock
        if(actnLocked.current) return;

        // set action locked to true to prevent other actions
        actnLocked.current = true;
        
        // try block
        try{

            // await clear prog
            await clearProg();

            // stop if component closed
            if(!compMounted.current) return;

            // create empty progress
            setCurrProg(createInitialProgress());

            // set progress state to ready
            setProgState(true);

            // set session to null
            setCurrSession(null);

            // display on screen message confirming reset
            setOSMsg("Progress reset confirmed!")

            // switch back to home screen
            setScreen("home")
        
        // catch errors to prevent crashes
        } catch(error) {

            // display retry message if screen is still mounted
            if(compMounted.current) setOSMsg("Progress reset unsuccessful, please retry.")
        
        // what happens after try or catch block
        } finally {

            //  set action locked to false
            actnLocked.current = false;

        }

    }

    // open topics source
    async function openS() {

        // try block to open link
        try {

            // pass source's URL to device's link opener
            await Linking.openURL(cat.sourceURL);
        
        // handle errors
        } catch(error) {

            // show message if link cannot open
            setOSMsg("Link Could Not Be Opened, Check Internet Connection.")

        }

    }

    // function to open AR
    async function openAR() {
        
        // if actions are locked or progress is not loaded or no category, return
        if(actnLocked.current || !progRdy || !cat) return;

        // lock repeated actions
        actnLocked.current = true;

        // clear on screen message
        setOSMsg("");

        // try block
        try{

            // wait for camera permission
            const perm = await ImagePicker.requestCameraPermissionsAsync();

            // keep learning available if permission denied
            if(!perm.granted) {

                // throw error
                throw new Error("Camera access required for AR");                
                
            }

            // if app component is mounted , open ar
            if(compMounted.current) setScreen("ar");


        // catch error
        }catch(error){

            // if screen mounted
            if(compMounted.current) {

                // explain error
                setOSMsg(error.message || "AR could not be opened.");
            }
        
        // finally
        } finally {

            // allow next action
            actnLocked.current = false;

        }

    }

    // show AR seperately
    if(currScreen === "ar" && cat) {

        // return ar fact card
        return <ARFCard cat={cat} onBackBtn={()=> setScreen("fact")} />;

    }

    // return the shared layout
    return(

        // safe area viewng space
        <SafeAreaView style={eqStyles.safeArea}>

            {/* Status Bar */}
            <StatusBar style="dark" />

            {/* Scrollable view */}
            <ScrollView contentContainerStyle={eqStyles.page}>

                {/* App heading */}
                <Text style={eqStyles.pageTitle}>SGEcoQuester</Text>

                {/* App subtitle */}
                <Text style={eqStyles.bodyText}>Notice an object, check suggestion and learn something.</Text>
                
                {/* Saved points and completed topics */}
                <Text style={eqStyles.heading}>{prog.points} points • {prog.completedCategoryKeys.length}/{learningCATs.length} topics completed!</Text>

                {/* Show on screen message when it contains text */}
                {!!osMsg && <Text style={eqStyles.noticeMsg} accessibilityLiveRegion="polite">{osMsg}</Text>}
                
                {/* show busy message with green spinner */}
                {!!busyMsg && <View style={eqStyles.panel}><ActivityIndicator color="rgb(23, 99, 63)"/><Text style={eqStyles.bodyText}>{busyMsg}</Text></View>}

                {/* if progress not ready and no task running, offer retry/reset */}
                {!progRdy && !busyMsg && <View style={eqStyles.panel}><Button title="Retry loading progress" onPress={restoreProg}/><Button title="Reset progress" onPress={askReset}/></View>}

                {/* home screen */}
                {progRdy && currScreen === "home" && <View style={eqStyles.panel}>
                    
                    {/* photo button */}
                    <PhotoBtns onChoose={selectImg} disabled={!!busyMsg} />

                    {/* Label option to learn without scanning a photo */}
                    <Text style={eqStyles.heading}>Learn Without Scanning</Text>

                    {/* Create a button for each item */}
                    {learningCATs.map((item) => <Button key={item.key} title={item.name} onPress={() => manualTopic(item.key)} disabled={!!busyMsg} color="rgb(23, 99, 63)" />)}

                    {/* keep earned badges and join titles with comma, show none yet if empty */}
                    <Text style={eqStyles.bodyText}>Badges: {learningBADGES.filter((badge) => prog.badgeIds.includes(badge.id)).map((badge) => badge.title).join(", ") || "None yet"}</Text>

                    {/* Button that runs askReset */}
                    <Button title="Reset progress" onPress={askReset} disabled={!!busyMsg} color="rgb(118, 83, 43)" />

                </View>}

                {/* review screen */}
                {currScreen === "review" && currSession && <View style={eqStyles.panel}>

                    {/* load current sessions imageuri */}
                    <Image source={{uri:currSession.imageUri}} style={eqStyles.photo} resizeMode="contain" accessibilityLabel="Image selected for recognition" />

                    {/* suggested topics name */}
                    <Text style={eqStyles.heading}>{currSession.suggestion?`Suggested topic: ${currSession.suggestion.categoryName}`:"No useful topic suggestion"}</Text>

                    {/* remind user that topic suggested may be wrong */}
                    <Text style={eqStyles.bodyText}>Suggested topic may be wrong.</Text>

                    {/* if suggestion exists,let a tap pass topic key to confirmCat */}
                    {currSession.suggestion && <Button title="Confirm suggestion" onPress={() => confirmCat(currSession.suggestion.categoryKey)} color="rgb(23, 99, 63)" />}
                    
                    {/* explain correction or rejection */}
                    <Text style={eqStyles.bodyText}>Choose different topic or retake photo.</Text>

                    {/* make button per topic */}
                    {learningCATs.map((item) => <Button key={item.key} title={item.name} onPress={() => confirmCat(item.key)} color="rgb(23, 99, 63)" />)}

                    {/* join each prediction's classnames */}
                    <Text style={eqStyles.bodyText}>Model labels: {currSession.predictions.map((prediction)=>prediction.className).join(";") || "None"}</Text>

                    {/* processing time text */}
                    <Text style={eqStyles.bodyText}>Processing Time: {currSession.latencyMs}ms</Text>

                    {/* button to set screen to home without awarding points */}
                    <Button title="Reject/Select another photo" onPress={() => setScreen("home")} color="rgb(118, 83, 43)" />

                </View>}

                {/* fact screen */}
                {currScreen === "fact" && cat && <View style={eqStyles.panel}>

                    {/* show manual learning label otherwise show confirmation */}
                    <Text style={eqStyles.bodyText}>{currSession?.source==="manual"?"Manual Learning":"Topic Confirmed"}</Text>

                    {/* display name of category as heading */}
                    <Text style={eqStyles.heading}>{cat.name}</Text>

                    {/* category fact */}
                    <Text style={eqStyles.fact}>{cat.fact}</Text>

                    {/* button to open source */}
                    <Button title={`Source: ${cat.sourceTitle}`} onPress={openS} color="rgb(23, 99, 63)" />

                    {/* optional AR activity to see fact card in AR */}
                    <Button title="View fact in AR" onPress={openAR} disabled={!!busyMsg} color="rgb(23, 99, 63)" />

                    {/* button to open quiz */}
                    <Button title="Continue to quiz" onPress={openSelectedQuiz} color="rgb(23, 99, 63)" />

                </View>}

                {/* quiz screen */}
                {currScreen === "quiz" && cat && <View style={eqStyles.panel}>

                    {/* question prompt */}
                    <Text style={eqStyles.heading}>{cat.question.prompt}</Text>

                    {/* mark option as selected answer */}
                    {cat.question.options.map((option,idx) => <Button key={option} title={`${ansIdx===idx?"Selected: ":""}${option}`} onPress={()=>setAnsIdx(idx)} disabled={!!busyMsg} color={ansIdx === idx?"rgb(18, 61, 43)" : "rgb(23, 99, 63)"} />)}

                    {/* submit answer button */}
                    <Button title="Check Answer" onPress={checkQuizAns} disabled={ansIdx === null || !!busyMsg}  color="rgb(4, 138, 75)" />

                    {/* read fact button */}
                    <Button title="Read fact again" onPress={() => setScreen("fact")} disabled={!!busyMsg} color="rgb(118, 83, 43)" />

                </View>}

                {/* result screen */}
                {currScreen === "result" && cat && latestResult && <View style={eqStyles.panel}>

                    {/* show points gained otherwise explain one-time reward */}
                    <Text style={eqStyles.heading}>{latestResult.gainedPoints ? `Correct! +${latestResult.gainedPoints} points` : "Correct! You already earned the rewards for this topic"}</Text>

                    {/* topic's fact repeated after correct answer */}
                    <Text style={eqStyles.fact}>{cat.fact}</Text>

                    {/* explain where progress is saved and that each topic earns points only once */}
                    <Text style={eqStyles.bodyText}>Progress is saved on device. Each topic earns points only once.</Text>

                </View>}

                {/* back to home button */}
                {currScreen !== "home" && <Button title="Back to home" onPress={() => {setOSMsg(""); setScreen("home");}} disabled={!!busyMsg} color="rgb(118, 83, 43)" />}

            </ScrollView>

        </SafeAreaView>

    )

};

// sgecoquester style sheet
const eqStyles = StyleSheet.create({

    // safe area style
    safeArea: {
        flex:1,
        backgroundColor:"rgb(185, 245, 157)"
    },

    page:{

        padding:20,
        gap:16,
        paddingBottom:36,
        width:"100%",
        maxWidth:680,
        alignSelf:"center",

    },

    // page title
    pageTitle: {
        fontSize: 28,
        fontWeight: "600",
        color:"rgb(2, 128, 75)"
    },

    // bodyText
    bodyText: {
        fontSize:16,
        lineHeight:24,
        color:"rgb(0,0,0)"
    },

    // headings style
    heading:{
        fontSize:20,
        fontWeight:"600",
        color:"rgb(0,0,0)"
    },

    // notice message styling
    noticeMsg:{
        fontSize:16,
        lineHeight:24,
        padding:12,
        backgroundColor:"rgb(255, 241, 206)",
        color:"rgb(84, 61, 19)"
    },

    // panel styling
    panel:{
        gap:14
    },

    // fact styling
    fact: {
        fontSize : 19,
        lineHeight:29,
        color :"rgb(18, 61, 43)",
    },

    // photo styling
    photo: {
        width:"100%",
        height:220,
        backgroundColor:"rgb(225, 232, 225)"
    }



});

