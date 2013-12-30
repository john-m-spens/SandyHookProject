var path;
var svg;
var g;
var gunTraceData;
var maxWidth = 1300;
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
            .on("mouseover", highlightState)
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
        document.getElementById("dialog-text").innerHTML = retrieveStatesData(Number(d.id)-1);

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

function retrieveStatesData(stateNum) {

    return gunTraceData.states[stateNum].name;


}