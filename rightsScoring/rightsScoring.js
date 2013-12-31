var path;
var svg;
var g;
var gunTraceData;
var maxWidth = 1600;
var top10List = new Array(10);
var scale = 1;

/*******

 displayMap - Loads map shapes and gun data from JSON files and displays the map

 width, height - size (in pixels) of the displayed map.  Width is the important parameter due to the columnar layout of the display page

 */
function displayMap(width, height) {

    scale = window.innerWidth / maxWidth;
    path = d3.geo.path();

    svg = d3.select("#map-display").append("svg")
        .attr("width", width)
        .attr("height", height);

    g = svg.append("g")
        .attr("id", "states");

    d3.json("statesData.json", function(data) {
        gunTraceData = data;
    });

    d3.json("statesMap.json", function(json) {
        g.selectAll("path")
            .data(json.features)
            .enter().append("path")
            .attr("d", path)
            .on("click", highlightState)
            .on("focus", paintScores());
        resizeMap(width, height);  // Enables resizing based on screen size/resolution
    });
}

/*******

 highlightState(d)

 Call back function for the mouse over event on the states.  Once a state is selected, the trace data is retrieved and displayed on the map

 d - The state object representing the selected state.

 */
function highlightState(d) {

    paintScores();
    if (d != null) {
/*        g.selectAll("path")
            .classed("Selected", function(cell) { return cell === d; }); */
        stateNum = Number(d.id)-1;
        document.getElementById("infoWindow").style.visibility = "visible";
        document.getElementById("state-name").innerHTML = gunTraceData.states[stateNum].name;
        document.getElementById("rights-score").innerHTML = gunTraceData.states[stateNum].score;
        document.getElementById("trace-rank").innerHTML = gunTraceData.states[stateNum].rank;
        document.getElementById("scoring-info").innerHTML = retrieveScoringInfo(stateNum);
        document.getElementById("tracing-info").innerHTML = retrieveTracingInfo(stateNum);
        $( "#ScoringThermometer" ).progressbar( "option", "value", gunTraceData.states[stateNum].score * 2);
        $( "#RankingThermometer" ).progressbar( "option", "value", gunTraceData.states[stateNum].rank);

        barColor = 'rgba(22, 174, 42, 0.89)';
        if ((gunTraceData.states[stateNum].rank) > 33) barColor = '#fffe13';
        if ((gunTraceData.states[stateNum].rank) > 66) barColor = '#cd0a0a';

        $( "#RankingThermometer > div").css({ 'background': barColor + ' repeat-x 50% 50%' });

    }
}

function paintScores() {

    g.selectAll("path")
        .classed("ExtraLow", function(cell) { return findMatchingStates(cell,0,10); })
        .classed("Low", function(cell) { return findMatchingStates(cell,11,20); })
        .classed("Medium", function(cell) { return findMatchingStates(cell,21,30); })
        .classed("High", function(cell) { return findMatchingStates(cell,31,40); })
        .classed("ExtraHigh", function(cell) { return findMatchingStates(cell,41,45); })
        .classed("Extreme", function(cell) { return findMatchingStates(cell,46,50); })

}

/*******

 findMatchingStates()

 Applied to all the states.  Selects appropriate coloring based on the number of guns that were traced in that state

 tgt - The state object representing the state where the guns were found.
 src - The state object representing the state where the guns originated
 bm - lower range of the band represented by this color
 tp - upper range of the band represented by this color

 */
function findMatchingStates(state, bm, tp) {

    stateNum = Number(state.id)-1;
    score = gunTraceData.states[stateNum].score;

    if((score >= bm) && (score <=tp)) {
        return (true);
    }
    else {
        return (false);
    }
}

/*******

 resizeMap()

 Calculates the map size based on scale (which is determined from the current screen resolution).

 width - width set by developer
 height - height set by developer

 */
function resizeMap(width, height) {

    x = width /2 * scale;
    y = height /2  * scale;
    g.selectAll("path")
        .attr("transform", "translate(" + x + "," + y + ")scale(" + scale +")translate(" + -x + "," + -y + ")");

}

function retrieveScoringInfo(stateNum) {

    scoringInfo = gunTraceData.states[stateNum].stateSummary;

    if (scoringInfo.length > 512) {
        scoringInfo = scoringInfo.substr(0, 512) + "...";
    }
    scoringInfo = "'<span class='window-state-quote'>" + scoringInfo + "</span>'<br>";
    return scoringInfo;
}


function retrieveTracingInfo(stateNum) {

    tracingInfo  = "<span class='window-state-text'> In 2012, "+ gunTraceData.states[stateNum].guns + " illegal guns were traced to " + gunTraceData.states[stateNum].name;
    tracingInfo = tracingInfo + ", which equates " + gunTraceData.states[stateNum].traces + " illegal guns recovered per 100,000 residents."
    tracingInfo  = tracingInfo  + "</span>";
    return tracingInfo ;
}