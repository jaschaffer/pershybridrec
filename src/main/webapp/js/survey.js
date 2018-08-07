/*
 * Contains code for Javascript Survey
 */

Survey.StylesManager.applyTheme("winter");
//Survey.defaultBootstrapCss.navigationButton = "btn btn-green";
//Survey.defaultBootstrapCss.rating.item = "btn btn-default my-rating";
//Survey.Survey.cssType = "bootstrap";

var likertScale = [
    {value: 1, text: "Strongly Disagree"},
    {value: 2, text: "Disagree"}, 
    {value: 3, text: "Somewhat Disagree"}, 
    {value: 4, text: "Neutral"}, 
    {value: 5, text: "Somewhat Agree"}, 
    {value: 6, text: "Agree"}, 
    {value: 7, text: "Strongly Agree"}
];

var persuasionScale = [
    {value: 1, text: "Not Persuasive at all"},
    {value: 2, text: "Not Persuasive"}, 
    {value: 3, text: "Somewhat not Persuasive "}, 
    {value: 4, text: "Neutral"}, 
    {value: 5, text: "Somewhat Persuasive"}, 
    {value: 6, text: "Persuasive"}, 
    {value: 7, text: "Very Persuasive"}
];

var hybrid_required = true;

var hybridQuestions = { pages: [] };

var rando_matrix = { 
	questions: [
    {
        type: "matrix",
        name: "randoa",
        isAllRowRequired:hybrid_required,
        title: "Please indicate whether you agree or disagree with the following statements about whether or not this artist matches your tastes.",
        columns: likertScale,
        rows: [
            {value: "item1",text: "This artist represents my tastes."},
            {value: "item2",text: "I dislike this artist."}, 
            {value: "item3",text: "Considering my tastes, this artist is a bad choice."}, 
            {value: "item4",text: "This artist matches my tastes accurately."}, 
            {value: "item5",text: "I like this artist."}, 
        ]
    },
    {
        type: "matrix",
        name: "randon",
        isAllRowRequired:hybrid_required,
        title: "Please indicate whether you agree or disagree with the following statements about whether or not this artist is new to you.",
        columns: likertScale,
        rows: [
            {value: "item1",text: "I have never listened to this artist before."},
            {value: "item2",text: "I am aware of this artist.."}, 
            {value: "item3",text: "I would be surprised if this artist was recommended to me."}, 
            {value: "item4",text: "I would not have found this artist on my own."}, 
            {value: "item5",text: "This artist is new to me."}, 
        ]
    }
    
]};

var accnov_matrix = { 
	questions: [
    {
        type: "matrix",
        name: "accuracy",
        isAllRowRequired:hybrid_required,
        title: "Please indicate whether you agree or disagree with the following statements about the recommendation's accuracy.",
        columns: likertScale,
        rows: [
            {value: "item1",text: "The recommended artist represents my tastes."},
            {value: "item2",text: "I dislike the recommended artist."}, 
            {value: "item3",text: "Considering my tastes, this is a bad recommendation."}, 
            {value: "item4",text: "This is an accurate recommendation."}, 
            {value: "item5",text: "I like the recommended artist."}, 
        ]
    },
    {
        type: "matrix",
        name: "novelty",
        isAllRowRequired:hybrid_required,
        title: "Please indicate whether you agree or disagree with the following statements about the recommendation's novelty.",
        columns: likertScale,
        rows: [
            {value: "item1",text: "I have never listened to this artist before."},
            {value: "item2",text: "I am aware of the recommended artist.."}, 
            {value: "item3",text: "I am surprised this artist was recommended."}, 
            {value: "item4",text: "I would not have found this artist on my own."}, 
            {value: "item5",text: "The recommended artist is new to me."}, 
        ]
    }
    
]};

var uxp_matrix = { 
	questions: [
    {
        type: "matrix",
        name: "uxp",
        isAllRowRequired:hybrid_required,
        title: "Please indicate whether you agree or disagree with the following statements about the recommendation's explanation.",
        columns: likertScale,
        rows: [
            {value: "item1",text: "This explanation makes me confident that I will like this artist."},
            {value: "item2",text: "This explanation makes the recommendation process clear to me."}, 
            {value: "item3",text: "I would enjoy using a recommendation system if it presented recommendations in this way."}, 
            {value: "item4",text: "This explanation for the recommendation is convincing."}, 
        ]
    }
]};

var rating_matrix = { 
	questions: [
	{
	    type: "matrix",
	    name: "rating",
	    isAllRowRequired:hybrid_required,
	    title: "",
	    columns: persuasionScale,
	    rows: [
	    	{value: "item1",text: "How persuasive is this explanation?"},
	    ]
	}
]};

var rank_matrix = { 
	questions: [
	{
        "type": "sortablelist",
        "name": "rank",
        "title": "Please rank these items in order of persuasiveness to you.",
        "isRequired": false,
        "choices": []
    }
]};

var vis_matrix = { 
	questions: [
    {
        type: "matrix",
        name: "visualization",
        isAllRowRequired:hybrid_required,
        title: "Please indicate whether you agree or disagree with the following statements about the explanation.",
        columns: likertScale,
        rows: [
            {value: "item1",text: "This explanation makes me confident that I will like this artist."},
            {value: "item2",text: "This explanation makes the recommendation process clear to me."}, 
            {value: "item3",text: "I would enjoy using a recommendation system if it presented recommendations in this way."}, 
            {value: "item4",text: "This explanation for the recommendation is convincing."}, 
        ]
    }
]};

var response_matrix  = {
	questions: [
	{
		type: "comment",
		name: "suggestions",
		title: "Please let us know about any other thoughts or feedback you would like to give us."
	}
]};

//Likely won't use this

//document.getElementById("qcontainer").appendChild(buildLikertQuestion("I am likes the music thank you sir.", "q1"));
//document.getElementById("qcontainer").appendChild(buildLikertQuestion("Give me music yes indeed pls.", "q2"));
//document.getElementById("qcontainer").appendChild(buildLikertQuestion("Five stars all around.", "q3"));
//document.getElementById("qcontainer").appendChild(buildLikertQuestion("Brick houses are better.", "q4"));
//document.getElementById("qcontainer").appendChild(buildLikertQuestion("But mud houses are more swingin", "q5"));

function buildLikertQuestion( questionTextToDisplay, groupName ) {
	
	var outer = document.createElement("DIV");
	var questionText = document.createElement("DIV");
	var radioButts = document.createElement("DIV");
	
	var t = document.createTextNode(questionTextToDisplay);
	questionText.setAttribute("style","font-weight: bold;");
	questionText.appendChild( t );
	
	var radioList = document.createElement("UL");
	radioList.setAttribute( "id", "likertQuestion");
	radioList.setAttribute( "class", "likert");
  var t = document.createTextNode("strongly disagree");
  radioList.appendChild( t );
  for (i=0;i<7;i++) {
      var nextListItem = document.createElement("LI");
      nextListItem.setAttribute("class","likert");
		var nextRadioButton = document.createElement("INPUT");
		nextRadioButton.setAttribute("id", groupName + "-" + (i+1));
		nextRadioButton.setAttribute("type", "radio");
		nextRadioButton.setAttribute("name", groupName);
		nextRadioButton.setAttribute("value", "1");
		var t = document.createTextNode("" + (i+1) + " ");
		radioList.appendChild(nextListItem);
		radioList.appendChild(nextRadioButton);
		radioList.appendChild(t);
  }
  var t = document.createTextNode("strongly agree");
  radioList.appendChild( t );
  radioButts.appendChild( radioList );
  
  outer.appendChild(questionText);
	outer.appendChild(radioButts);
  
  return outer;
}