var path;
var svg;
var g;
var gunTraceData;
var maxWidth = 1900;
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

    d3.json("stateData.json", function(data) {
        gunTraceData = data;
    });

    d3.json("statesMap.json", function(json) {
        g.selectAll("path")
            .data(json.features)
            .enter().append("path")
            .attr("d", path)
            .on("mouseover", findStatesReceivingGuns);
        resizeMap(width, height);  // Enables resizing based on screen size/resolution
    });
}

/*******

 findStatesReceivingGuns(d)

 Call back function for the mouse over event on the states.  Once a state is selected, the trace data is retrieved and displayed on the map

 d - The state object representing the selected state.

 */
function findStatesReceivingGuns(d) {

    if (d != null) {
        g.selectAll("path")
            .classed("ExtraLow", function(cell) { return findMatchingStates(cell,d,1,25); })
            .classed("Low", function(cell) { return findMatchingStates(cell,d,25,50); })
            .classed("Medium", function(cell) { return findMatchingStates(cell,d,50,100); })
            .classed("High", function(cell) { return findMatchingStates(cell,d,100,500); })
            .classed("ExtraHigh", function(cell) { return findMatchingStates(cell,d,500,1000); })
            .classed("Extreme", function(cell) { return findMatchingStates(cell,d,1000,20000); })
            .classed("Selected", function(cell) { return cell === d; });
        createAccompanyingText(d);
    }
}

/*******

 findMatchingStates()

 Applied to all the states.  Selects appropriate coloring based on the number of guns that were traced in that state

 tgt - The state object representing the state where the guns were found.
 src - The state object representing the state where the guns originated
 bm - lower range of the band represented by this color
 tp - upper range of the band represented by this color

 */
function findMatchingStates(tgt, src, bm, tp) {

    cl = Number(src.id)-1;
    rw = Number(tgt.id)-1;
    nGuns = gunTraceData.states[cl].data[rw];
   return (nGuns >= bm) && (nGuns <=tp);

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

/*******

 createAccompanyingText()

 Populated defined spans and divs in the HTML page based on the currently selected state

 d - The state object of the currently selected state
 */
function createAccompanyingText(d) {

    var iState;
    var nGuns = 0; // number of the guns traced to the current state
    var nTotGuns = 0;  // number of guns traced in all states
    var nStates = 0;  // number of states where guns were traced

    if (d != null) {
        iState = Number(d.id)-1;
        var stateName = gunTraceData.states[iState].name;

        for (var k in gunTraceData.states) {
            for (var j in gunTraceData.states[k].data) {
                nTotGuns += gunTraceData.states[k].data[j];
                if (k == iState) {
                    nGuns += gunTraceData.states[k].data[j];

                    if (gunTraceData.states[k].data[j] > 0) {
                        nStates++;
                    }
                }
            }
        }
        document.getElementById("displayStateDetails").setAttribute("style","visibility: visible;");
        document.getElementById("displayStateTable").setAttribute("style","visibility: visible;");
        document.getElementById("stateName").innerHTML = stateName;
        document.getElementById("originState").innerHTML = stateName;
        document.getElementById("stateOfOrigin").innerHTML = stateName;
        document.getElementById("numGunsTraced").innerHTML = nmbFormatter(nGuns);
        document.getElementById("pctAllTracedGuns").innerHTML = pctFormatter(nGuns, nTotGuns);
        document.getElementById("gunsPerCapita").innerHTML = nmbFormatter(nGuns/gunTraceData.states[iState].population * 100000,2);
        createTop10Table(iState);
    }
}

/*******

 createTop10Table() Populates the  10 recipients of guns table for the selected state.

 nState: numeric ID of the selected state.  TODO Make this similar to the other routines where  we retrieve the state object

 */
function createTop10Table(nState) {

    createTop10List(nState);

    for (var i=0;i<10;i++) {
        document.getElementById("state"+i).innerHTML = top10List[i][0];
        document.getElementById("gunsTraced"+i).innerHTML = nmbFormatter(top10List[i][1]);
        document.getElementById("totalTraced"+i).innerHTML = pctFormatter(top10List[i][1], top10List[i][2]);
    }
}

/*******

 createTop10List() Generates the underlying list to support generation of the top 10

 stateNum: numeric ID of the selected state.  TODO Make this similar to the other routines where  we retrieve the state object

 */
function createTop10List(stateNum) {

    clearTop10List();

    for (var i in gunTraceData.states[stateNum].data)   {
        for (var j=0;j<10;j++) {
            if (gunTraceData.states[stateNum].data[i] > top10List[j][1]) {
                reshuffleTop10(j);
                top10List[j] = [gunTraceData.states[i].name, gunTraceData.states[stateNum].data[i],getTotalTracesForState(i)];
                j = 10;
            }
        }
    }
}

/*******

 reshuffleTop10() Technique to support the sorting method.

 */
function reshuffleTop10(startingPoint) {

    for (var i = 9; i > startingPoint;i--) {
        top10List[i] = top10List[i-1];
    }
}

function clearTop10List() {

    for (var i=0;i<10;i++) {
        top10List[i] = [" ", 0, 0];
    }
}

/*******

 getTotalTracesForState() Counts traces from a specific state

 */
function getTotalTracesForState(stateNum) {

    var totTraces = 0;

    for (var i in gunTraceData.states[stateNum].data)  {
        totTraces += gunTraceData.states[stateNum].data[i];
    }
    return totTraces;
}

/*

Cheap & easy number Formatter.  Doesn't handle anything beyond a single comma.

*/
function nmbFormatter(num, decPlace) {

    if (num == 0) {
        return "0";
    }

    var outString = String(num);
    var integers, decimals;
    var dec = "";
    var decPtr = outString.indexOf(".");

    if (decPlace == null) {
        decPlace = -1;
    }

    if ((decPtr  > -1)) {
        integers = outString.substr(0,decPtr);

        if ((decPlace == -1)) {
            decimals = outString.substr(decPtr+1,outString.length-decPtr);
            dec = ".";
        }
        if ((decPlace == 0)) {
            decimals = "";
        }
        if ((decPlace > 0)) {
            decimals = outString.substr(decPtr+1,decPlace);
            dec = ".";
        }
    }
    else {
        integers = outString;
        decimals = "";
    }
    if (integers.length > 3) {
        integers = integers.substr(0,(integers.length - 3))+ "," + integers.substr((integers.length - 3), 3);
    }
    return (integers + dec + decimals);
}

/*

 Cheap & easy percent Formatter.  Doesn't handle anything beyond a single comma.

 */
function pctFormatter(num, den) {

    if ((num === 0) || (den === 0)) {
        return "0%";
    }

    var quotient = String(num / den);
    var ptr = quotient.indexOf(".");

    if (ptr > -1) {
        var integers = quotient.substr(ptr+1,2);

        if (integers.substr(0,1) == "0") {
            integers = integers.substr(1,1);
        }

        var decimals = String(quotient.substr(ptr+3,2));
        return integers + "." + decimals + "%"  ;
    }
    return quotient;
}