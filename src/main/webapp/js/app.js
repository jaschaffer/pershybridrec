/*
 * JBoss, Home of Professional Open Source
 * Copyright 2013, Red Hat, Inc. and/or its affiliates, and individual
 * contributors by the @authors tag. See the copyright.txt in the
 * distribution for a full listing of individual contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*
Core JavaScript functionality for the application.  Performs the required
Restful calls, validates return values, and populates the member table.
 */

var member = "";
var memberList = [];
var qdata_object = {};

/* Builds the updated table for the member list */
function buildMemberRows(members) {
    return _.template( $( "#member-tmpl" ).html(), {"members": members});
}

function getMember( amtid ) {
	console.log( "Looking up: " + JSON.stringify(amtid) );
    $.ajax({
        url: "rest/members/" + amtid,
        cache: false,
        dataType: "json",
        success: function(data) {
        	member = data;
        	if ( member.qdata == "none" ) {
        		console.log("Waiting 5 seconds...");
        		setTimeout( function(){ getMember(amtid); },5000 );
        	}
        	else {
	        	//showCluster();
        		$('#loader').remove();
        		qdata_object = JSON.parse(member.qdata);
	        	console.log("Finished loading JSON");
	        	console.log(qdata_object);
	        	if ( member.rdata == "none" ) {
	        		if ( qdata_object.Error == 1 )
	        			showErrorMessage();
	        		else
	        			startSurvey();
	        	}
	        	else {
	        		showThankYouMessage();
	        	}
	        	
        	}
        },
        error: function(error) {
        	$('#loader').remove();
            console.log("error getting member -" + error.status);
            showNoMemberMessage();
        }
    });
}

function showNoMemberMessage() {
	console.log("Showing error message");
	$('#imagerec').hide();
	$('#psl-survey-container').show().css('display','flex');
	$('#textexpl').html( "Sorry, we could not find your AMTID. <br>" +
			"If you believe you are seeing this message in error, please e-mail <span style='color:#D87300; font-weight:bold'>j.au.schaffer@gmail.com</span>." );
	$('#textexpl').show();
}


function tryCrawlAgain() {
	console.log("Trying the crawler again");
	member.qdata = "none";
	reset = true;
	saveData( member );
	$('#crawlagainbutton').disabled = true;
}

function showErrorMessage() {
	$('#imagerec').hide();
	$('#psl-survey-container').show().css('display','flex');
	$('#textexpl').html( "Sorry, we could not build your recommendations.  This is because you have not liked enough artists in your last.fm account, or you are not following enough users.<br>" +
			"If you would like to continue with the study, <span style='color:#D87300; font-weight:bold'>please follow the directions located <a target=\"blank\" href=\"https://docs.google.com/document/d/1ROI1BrYKkfLw_O9uLWROESKigCYa4wiKUeQOxxkEfnk/edit\">here</a></span><br>" +
			"<span style='color:#D87300; font-weight:bold'>Then, click the below button</span>.  If you believe you are seeing this message in error, please e-mail <span style='color:#D87300; font-weight:bold'>j.au.schaffer@gmail.com</span>." );
    $('#textexpl').show();
    document.getElementById("crawlagainbutton").onclick = tryCrawlAgain;
    $('#crawlagainbutton').show();
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//<a href="https://www.w3schools.com">Visit W3Schools</a>

function showThankYouMessage() {
	$('#imagerec').hide();
	$('#psl-survey-container').show().css('display','flex');
//	$('#textexpl').html( "Thank you for completing our study!  Your completion code is <span style='color:#D87300; font-weight:bold'>" + member.completionCode + "</span>" );
//    $('#textexpl').show();
	thankYou();
}

function startSurvey() {
	
	var jsonLocation = 0;
	rando(0);
	
	// build randos
	for ( var j = 0; j < 3; j++ ) {
		var rando_next = $.extend( true, {}, rando_matrix);
		rando_next.questions[0].name = rando_next.questions[0].name + "::" + jsonLocation;
		rando_next.questions[1].name = rando_next.questions[1].name + "::" + jsonLocation;
		hybridQuestions.pages.push( rando_next);
		jsonLocation++;
	}
   
//	accnov(3);
	
    //	build explanation rating question
	var accnov_next = $.extend( true, {}, accnov_matrix);
	accnov_next.questions[0].name = accnov_next.questions[0].name + "::" + jsonLocation;
	accnov_next.questions[1].name = accnov_next.questions[1].name + "::" + jsonLocation;
	hybridQuestions.pages.push( accnov_next );
	jsonLocation++;
	
	var expl_order = [ "contentBasedJaccard","socialBased","itemBasedLastfm","popularityBased","itemBasedCF","contentBasedTag","userBasedCF","satisfice" ];
	expl_order = shuffle( expl_order );
	
//	qdata_object[jsonLocation][0].numOfStyles
	for ( var j = 0; j < expl_order.length; j++ ) {
		
		var nextVariable = qdata_object[jsonLocation][0][ expl_order[j] ];
		if ( expl_order[j] == "satisfice" ) {
			var uxp_next = $.extend( true, {}, rating_matrix );
	    	uxp_next.questions[0].name = expl_order[j];
			uxp_next.questions[0].title = "Please answer 'Somewhat not Persuasive' to this question.";
			hybridQuestions.pages.push( uxp_next );
		}
		else if ( typeof nextVariable !== 'undefined' && nextVariable !== null)  {
			var uxp_next = $.extend( true, {}, rating_matrix );
	    	uxp_next.questions[0].name = expl_order[j]  + "::" + jsonLocation;
			uxp_next.questions[0].title = uxp_next.questions[0].title +qdata_object[jsonLocation][0][ expl_order[j] ];
			hybridQuestions.pages.push( uxp_next );
		}
	}
	jsonLocation++;
    
    //	build explanation ranking questions
	var accnov_next = $.extend( true, {}, accnov_matrix);
	accnov_next.questions[0].name = accnov_next.questions[0].name + "::" + jsonLocation;
	accnov_next.questions[1].name = accnov_next.questions[1].name + "::" + jsonLocation;
	hybridQuestions.pages.push( accnov_next );
	jsonLocation++;
	
	var rank_order = [ "contentBasedJaccard","socialBased","itemBasedLastfm","popularityBased","itemBasedCF","contentBasedTag","userBasedCF" ];
	rank_order = shuffle( rank_order );
	
	var rank_next = $.extend( true, {}, rank_matrix );
	rank_next.questions[0].name = rank_next.questions[0].name+ "::" + jsonLocation;
	for ( var j = 0; j < rank_order.length; j++ ) {
		var nextVariable = qdata_object[ jsonLocation ][0][ rank_order[j] ];
		if  ( typeof nextVariable !== 'undefined' && nextVariable !== null ) {
			rank_next.questions[0].choices.push( qdata_object[ jsonLocation ][0][ rank_order[j]] );
		}
	}

	hybridQuestions.pages.push( rank_next );
	jsonLocation++;
    
    //	build visualization questions
    var vis_order = [ "text","collapsible","venn","cluster" ];
    
	var accnov_next = $.extend(true, {}, accnov_matrix);
	accnov_next.questions[0].name = accnov_next.questions[0].name + "::" + jsonLocation;
	accnov_next.questions[1].name = accnov_next.questions[1].name + "::" + jsonLocation;
	hybridQuestions.pages.push( accnov_next );
	jsonLocation++;
	
	var vis_array = [];
	for ( var j = 0; j < vis_order.length; j++ ) {
		var vis_next = $.extend(true,{},vis_matrix);
		vis_next.questions[0].name = vis_order[j] + "::" + jsonLocation;
		vis_array.push( vis_next );
		jsonLocation++;
	}
	
	vis_array = shuffle( vis_array );
	for ( var j = 0; j < vis_array.length; j++ ) {
		hybridQuestions.pages.push( vis_array[j] );
	}
    
    hybridQuestions.pages.push(response_matrix);
    hybridQuestions.completedHtml = "Thank you for participating in the research study.  Your completion code is: <span style='color:#D87300; font-weight:bold'>" + member.completionCode + "</span>";
    
    //	------------------------------------------------------------------
	$('#psl-survey-container').show().css('display','flex');
	window.survey = new Survey.Model(hybridQuestions);
    $("#surveyElement").Survey({model:survey});
    survey.showPrevButton = false;
    

    survey.onCurrentPageChanged.add(function (result) {
    	$('html, body').animate({ scrollTop: 0 }, 'medium');
    	$('#svgexpl').hide();
    	$('#textrec').html( $('#textrec').html().replace("recommend ","recommended " ) );
    	
    	var data_index = survey.currentPage.questions[ 0 ].name.split("::")[1];
    	if ( survey.currentPage.questions[0].name.includes("rando") ) {
    		rando( data_index );
    	}
    	if ( survey.currentPage.questions[0].name.includes("accuracy") ) {
    		accnov( data_index );
    	}
    	if ( survey.currentPage.questions[0].name.includes("style") ) {
    		expl( data_index );
    	}
    	if ( survey.currentPage.questions[0].name.includes("rank") ) {
    		rank( data_index );
    	}
    	if ( survey.currentPage.questions[0].name.includes("text") ) {
    		simpleExpl( data_index );
    	}
    	if ( survey.currentPage.questions[0].name.includes("collapsible") ) {
    		collapsible( data_index );
    	}
    	if ( survey.currentPage.questions[0].name.includes("venn") ) {
    		john_venn(data_index);
    	}
    	if ( survey.currentPage.questions[0].name.includes("cluster") ) {
    		cluster(data_index);
    	}
    	if ( survey.currentPage.questions[0].name.includes("suggestions") ) {
    		suggestions(data_index);
    	}

    });

    survey.onComplete.add(function (result) {
    	console.log("Survey finished");
    	$('#textrec').hide();
    	$('#bandlink').hide();
    	$('#textexpl').hide();
    	
    	member.rdata = JSON.stringify( survey.data );
    	saveData( member );
    	
    });

}

function thankYou() {
    $('#textexpl').html( "Thank you for completing our study!  Your completion code is <span style='color:#D87300; font-weight:bold'>" + member.completionCode + "</span>" );
    $('#textexpl').show();
}

function rando( pageNumber ) {
	$('#textrec').html( "Consider the following artist: <b><a target=\"blank\" href=\"" + qdata_object[pageNumber][0]["lastfm-url"] + "\">" + qdata_object[pageNumber][0].item + "</a></b>.  <span style='color:#D87300; font-weight:bold'>This artist is NOT being recommended to you.</span>  We would just like to know what you think about this artist." );
    $('#imagerec').attr( 'src', qdata_object[pageNumber][0]["lastfm-image"] );
    $('#bandlink').attr( 'href', qdata_object[pageNumber][0]["lastfm-url"] );
    $('#textexpl').html( "If you have never heard this artist, <span style='color:#D87300; font-weight:bold'>click the image</span> to listen to a preview of their music (a new tab will be opened).  " +
    		"Then, <span style='color:#D87300; font-weight:bold'>please answer the questions below</span>.  If you have already heard this artist, please proceed directly to the questions below." );
    $('#bandlink').show();
}

//

function accnov( pageNumber ) {
    $('#textrec').html( "<span style='color:#D87300; font-weight:bold'>Based on your last.fm profile, we recommend</span> <b><a target=\"blank\" href=\"" + qdata_object[pageNumber][0]["lastfm-url"] + "\">" + qdata_object[pageNumber][0].item + "</a></b>." );
    $('#imagerec').attr( 'src', qdata_object[pageNumber][0]["lastfm-image"] );
    $('#bandlink').attr( 'href', qdata_object[pageNumber][0]["lastfm-url"] );
    $('#textexpl').html( "If you have never heard this artist, <span style='color:#D87300; font-weight:bold'>click the image</span> to listen to a preview of their music (a new tab will be opened).  " +
    		"Then, <span style='color:#D87300; font-weight:bold'>please answer the questions below</span>.  If you have already heard this artist, please proceed directly to the questions below." );
    $('#bandlink').show();
}

function expl( pageNumber ) {
	$('#textexpl').html( "Please consider the below explanation for why this artist was recommended.  Then, please rate how <span style='color:#D87300; font-weight:bold'>persuasive</span> this explanation is to you." );
}

function simpleExpl( pageNumber ) {
	var explstring = "<b>Now, consider the following reasons for why this artist was recommended:</b><ul> ";
	var rawstring = qdata_object[pageNumber][0].data;
	var rawStringSplit = rawstring.split( "\\n" );
	for ( var i = 1; i < rawStringSplit.length - 1; i++ ) {
		var nextexpl = rawStringSplit[ i ].replace(/[0-9]\./g,"");
		explstring += "<li>" + nextexpl + "</li>";
	}
	explstring += "</ul>";
//	explstring += rawstring;
	$('#textexpl').html( explstring );
}

function collapsible( pageNumber ) {
	// text corrections
	for ( var i = 0; i < qdata_object[pageNumber][0].children.length; i++ ) {
		var nextChild = qdata_object[pageNumber][0].children[i];
		if ( nextChild.name == "is liked by people who listen to your profile" )
			nextChild.name = "is liked by people who listen to artists in your profile";
	}
	
	var explstring = "The tree below explains why this artist was recommended.  <span style='color:#D87300; font-weight:bold'>Please click the orange circles to inspect different explanations.</span>";
	$('#textexpl').html( explstring );
	renderTree( qdata_object[pageNumber][0], "svgexpl");
	$('#svgexpl').show();
}

function john_venn( pageNumber ) {
	var explstring = "The Venn diagram below explains why this artist was recommended.";
	$('#textexpl').html( explstring );
	renderVenn( qdata_object[pageNumber][0], "svgexpl");
	$('#svgexpl').show();
}

function cluster( pageNumber ) {
	// text corrections
	for ( var i = 0; i < qdata_object[pageNumber].length; i++ ) {
		var nextGuy = qdata_object[pageNumber][i];
		if ( nextGuy.id.includes("is liked by people who listen to your profile" ) ) {
			var splitGuy = nextGuy.id.split(".");
			splitGuy[ 1 ] = "is liked by people who listen to artists in your profile";
			nextGuy.id = splitGuy[ 0 ] + "." + splitGuy[ 1 ];
			if ( splitGuy.length == 3 )
				nextGuy.id += "." + splitGuy[ 2 ];
		}
	}
	
	var explstring = "The tree below explains why this artist was recommended.";
	$('#textexpl').html( explstring );
	renderClusterDendrogram( qdata_object[pageNumber], "svgexpl");
	$('#svgexpl').show();
}

function radial( pageNumber ) {
	var explstring = "<b>Below is a visualization explaining why this artist was recommended:";
	$('#textexpl').html( explstring );
	renderRadialDendrogram( qdata_object[pageNumber], "svgexpl");
	$('#svgexpl').show();
}

function rank( pageNumber ) {
	var explstring = "For this recommendation, please consider the following explanations that are given below in the green boxes.  Then, drag the explanations to <span style='color:#D87300; font-weight:bold'>rank them in order of persuasiveness</span>, according to you.  You do not have to rank all of the explanations, if some are not persuasive, please leave them in the lower box.";
	$('#textexpl').html( explstring );
}

function suggestions( pageNumber ) {
	$('#textrec').hide();
	$('#bandlink').hide();
	$('#textexpl').hide();
}

/* Uses JAX-RS GET to retrieve current member list */
function updateMemberTable() {
    $.ajax({
        url: "rest/members",
        cache: false,
        success: function(data) {
            //$('#members').empty().append(buildMemberRows(data));
            
//            $$("webixlist").clearAll();
//            for (i=0; i < data.length; i++) {
//            	$$("webixlist").add(data[i]);
//            }
        	
        	for ( i = 0; i < data.length; i++ ) {
        		memberList[ i ] = data[ i ];
        		console.log( "members: " + memberList[ i ].amtid );
        	}
        	
        },
        error: function(error) {
            console.log("error updating table -" + error.status);
        }
    });
}

/*
Attempts to register a new member using a JAX-RS POST.  The callbacks
the refresh the member table, or process JAX-RS response codes to update
the validation errors.
 */
function registerMember(memberData) {
    //clear existing  msgs
    $('span.invalid').remove();
    $('span.success').remove();
    console.log( "Aight sendin' dat yo yo b-boy");

    $.ajax({
        url: 'rest/members',
        contentType: "application/json",
        dataType: "json",
        type: "POST",
        data: JSON.stringify(memberData),
        success: function(data) {
        	console.log("sent member data");
        },
        error: function(error) {
            if ((error.status == 409) || (error.status == 400)) {
                //console.log("Validation error registering user!");

                var errorMsg = $.parseJSON(error.responseText);
                console.log(errorMsg);

                $.each(errorMsg, function(index, val) {
                    $('<span class="invalid">' + val + '</span>').insertAfter($('#' + index));
                });
            } else {
                //console.log("error - unknown server issue");
                $('#formMsgs').append($('<span class="invalid">Unknown server error</span>'));
            }
        }
    });
}

var reset = false;
function saveData(memberData) {
    $.ajax({
        url: 'rest/saves',
        contentType: "application/json",
        dataType: "json",
        type: "POST",
        data: JSON.stringify(memberData),
        success: function(data) {
            console.log("member data was saved");
            if ( reset )
            	location.reload(true);
        },
        error: function(error) {
            if ((error.status == 409) || (error.status == 400)) {
                //console.log("Validation error registering user!");

                var errorMsg = $.parseJSON(error.responseText);
                console.log(errorMsg);

                $.each(errorMsg, function(index, val) {
                    $('<span class="invalid">' + val + '</span>').insertAfter($('#' + index));
                });
            } else {
                //console.log("error - unknown server issue");
                $('#formMsgs').append($('<span class="invalid">Unknown server error</span>'));
            }
        }
    });
}

function hellojboss() {

    $.ajax({
        url: 'rest/hello',
        contentType: "application/json",
        dataType: "json",
        type: "POST",
        success: function(data) {
            //console.log("Member registered");
        },
        error: function(error) {
            if ((error.status == 409) || (error.status == 400)) {
                //console.log("Validation error registering user!");

                var errorMsg = $.parseJSON(error.responseText);

                $.each(errorMsg, function(index, val) {
                    $('<span class="invalid">' + val + '</span>').insertAfter($('#' + index));
                });
            } else {
                //console.log("error - unknown server issue");
                $('#formMsgs').append($('<span class="invalid">Unknown server error</span>'));
            }
        }
    });
}

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

