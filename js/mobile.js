var barplotSvg;
var timeplotSvg;
var deviceWidth;
var deviceHeight;

// Ebola by Country
var ebc = {};

// Ebola by Date
var ebd = {};

var dataOfInterest = [];

var dateCol = "Date";
var valueCol = "value";
var countryCol = "Country";
var indicatorCol = "Indicator";

var indicatorOfInterest = "Cumulative number of confirmed Ebola cases";

var dataFile = "data/ebola.csv";

var parseDate = d3.time.format("%Y-%m-%d").parse;


$(document).ready(function () {

    deviceWidth = $(document).width();
    deviceHeight = $(document).height();

    //read the csv file and collect entried for each place

    d3.csv(dataFile, function (error, data) {

        data.forEach(function (d) {

            //d[dateCol] = parseDate(d[dateCol]);
            d[valueCol] = +d[valueCol];

            if (d[indicatorCol] == indicatorOfInterest) {

                if (!ebc[d[countryCol]]) {

                    ebc[d[countryCol]] = 0;
                }

                if (ebc[d[countryCol]] < d[valueCol]) {

                    ebc[d[countryCol]] += d[valueCol];
                }



                if (!ebd[d[dateCol]]) {

                    ebd[d[dateCol]] = 0;
                }

                if (ebd[d[dateCol]] < d[valueCol]) {
                    ebd[d[dateCol]] = d[valueCol];
                }


                dataOfInterest.push(d);
            }

        });

        //        ebc = d3.entries(ebc);
        //
        //
        //
        //        ebd = d3.entries(ebd);
        //
        //        ebd.sort(function (a, b) {
        //            if (parseDate(b.key) == parseDate(a.key)) return 0;
        //            if (parseDate(b.key) < parseDate(a.key)) return 1;
        //            return -1;
        //        });

        createRadialPlot();

    });

});

function createRadialPlot() {

   
    var ebcCopy = JSON.parse(JSON.stringify(ebc));;
    
    var keys = Object.keys(ebc);
    
    for (var i = 0; i < keys.length; i++) {
    
        ebcCopy[keys[i]] = Math.pow(ebcCopy[keys[i]], 0.3); 
    }
    
     var data = [{
        'data': ebcCopy
    }];
    
    
    ebcCopy = d3.entries(ebcCopy);

    var chart = radialBarChart()
        .barHeight((deviceWidth-150)/2)
        .domain([0, d3.max(ebcCopy, function (d) {
            return d.value
        })])
        .barColors(['#FF6666']);

    d3.select('#charts')
        .datum(data)
        .call(chart);
}