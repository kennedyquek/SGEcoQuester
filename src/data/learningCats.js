// store all categories facts, sources , and badge data for the quiz
export const learningCATs = [
    {
        key:"recycle",
        name:"Recycling and Waste",
        shortName:"Recycling",
        colour:"#17633F",
        points: 50,
        aliases:[
            "ashcan",
            "beer bottle",
            "carton",
            "coke bottle",
            "milk can",
            "pop bottle",
            "soda bottle",
            "trash can",
            "water bottle",
            "wine bottle"

        ],
        fact: "Recyclables made out of paper,glass and metal can be deposited in Singapore's blue recycling bins.",
        sourceTitle:"NEA National Recycling Programme",
        sourceURL:"https://www.nea.gov.sg/our-services/waste-management/3r-programmes-and-resources/national-recycling-programme",
        question:{
            prompt: "Which of the following belong in the blue recycling bins?",
            options:[
                "Paper, plastic,glass and metal recyclables",
                "Liquid and Food waste",
                "All household waste"
            ],
            correctIndex:0
        }
    },
    {
        key:"greenery",
        name:"City in Nature",
        shortName:"Greenery",
        colour:"#3C7A3E",
        points: 40,
        aliases:[
            "daisy",
            "flowerpot",
            "greenhouse",
            "rapeseed",
            "yellow lady's slipper"          
        ],
        fact: "Singapore's Green Plan Includes the goal of planting one million more trees across the country.",
        sourceTitle:"Singapore's Green Plan 2030 targets",
        sourceURL:"https://www.greenplan.gov.sg/targets/",
        question:{
            prompt: "What is the OneMillionTrees movement working towards?",
            options:[
                "Removing Trees from the roadsides",
                "Planting one million more trees",
                "Replacing parks with buildings"
            ],
            correctIndex:1
        }
    },
    {
        key:"water",
        name:"Water and blue spaces",
        shortName:"Water",
        colour:"#176A8A",
        points: 45,
        aliases:[
            "breakwater",
            "dam",
            "dock",
            "fountain",
            "lakeside",
            "pier",
            "seashore"

        ],
        fact: "NEWater is ultra-clean and high-grade water that is produced by treating used water.",
        sourceTitle:"PUB NEWater",
        sourceURL:"https://www.pub.gov.sg/Public/WaterLoop/OurWaterStory/NEWater",
        question:{
            prompt: "What is used to produce NEWater?",
            options:[
                "Only seawater",
                "Untreated Rainwater",
                "Treated used water"
            ],
            correctIndex:2
        }
    },
    {
        key:"energy",
        name:"Clean Energy",
        shortName:"Energy",
        colour:"#A66B00",
        points: 60,
        aliases:[
            "solar dish",
            "windmill"
        ],
        fact: "Solar energy is Singapore's most viable renewable enery source.However, limited land and cloud cover create constraints",
        sourceTitle:"Solar Energy Market Authority",
        sourceURL:"https://www.ema.gov.sg/our-energy-story/energy-supply/solar",
        question:{
            prompt: "What is the most viable energy source for Singapore",
            options:[
                "Solar Energy",
                "Hydroelectric dams",
                "Geothermal Volcanoes"
            ],
            correctIndex:0
        }
    }
];
// list of badges in the gamified app
export const learningBADGES = [
    {
        id:"first-learning-mission",
        title:"First Learning Mission",
        requiredCount: 1
    },
    {
        id:"eco-reviewer",
        title:"Eco Reviewer",
        requiredCount: 2
    },
    {
        id:"eco-explorer",
        title:"Eco Explorer",
        requiredCount: learningCATs.length
    }
];

// helper function that searches for category with requested key
export function findCat(categoryKey) {

    // return the category
    return learningCATs.find((cat)=>cat.key === categoryKey) || null;

};