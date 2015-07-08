var barplotSvg;
var timeplotSvg;
var deviceWidth;
var deviceHeight;

// Ebola by Country
var ebc = {};

// Ebola by Date
var ebd = {};

// Ebola by Date by Country
var ebcd = {};

var dataOfInterest = [];

var dateCol = "Date";
var valueCol = "value";
var countryCol = "Country";
var indicatorCol = "Indicator";

var shorts = {
    "United Kingdom": "UK",
    "United States of America": "USA",
    "Sierra Leone": "SL"
};

var indicatorOfInterest = "Cumulative number of confirmed Ebola cases";

var dataFile = "data/ebola.csv";

var parseDate = d3.time.format("%Y-%m-%d").parse;


//$(document).ready(function () {

var intializeData = function() {

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

        //createRadialPlot();
        //smallMultiples();

        //play around with dataOfInterest

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

    });

}
//);

function createRadialPlot() {

    if ($('#radial').length != 0) {
        return;
    }

    var ebcCopy = JSON.parse(JSON.stringify(ebc));;

    var keys = Object.keys(ebc);

    for (var i = 0; i < keys.length; i++) {

        if (ebcCopy[keys[i]] > 100) {
            ebcCopy[keys[i]] = Math.pow(ebcCopy[keys[i]], 0.6);

        } else {

            ebcCopy[keys[i]] = 20 + Math.pow(ebcCopy[keys[i]], 1.3);

        }
    }

    var data = [{
        'data': ebcCopy
    }];


    ebcCopy = d3.entries(ebcCopy);

    var barH = deviceHeight > deviceWidth ? deviceWidth : deviceHeight;

    var chart = radialBarChart()
        .barHeight((barH) / 3)
        .domain([0, d3.max(ebcCopy, function (d) {
            return d.value;
        })])
        .barColors(['#FF6666']);

    d3.select('#charts')
        .datum(data)
        .call(chart);


}

function smallMultiples() {

    if ($('#sm').length != 0) {
        return;
    }

    dataOfInterest.sort(function (a, b) {
        if (parseDate(b[dateCol]) == parseDate(a[dateCol])) return 0;
        if (parseDate(b[dateCol]) < parseDate(a[dateCol])) return 1;
        return -1;
    });


    //multiple bar charts with brush and link 

    var margin = {
            top: 25,
            right: 30,
            bottom: 150,
            left: 60
        },
        width = deviceWidth - 30 - margin.left - margin.right,
        height = deviceHeight - 70 - margin.top - margin.bottom,
        contextHeight = height / 10;

    var contextWidth = width * 0.95;



    var svg = d3.select("#charts")
        .append("svg")
        .attr("id", "sm")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    //var list of countries -- precomputed
    var countries = Object.keys(ebc);

    var charts = [],
        maxDataPoint = {};

    var countriesCount = countries.length,
        startDate = dataOfInterest[dataOfInterest.length - 1][dateCol],
        endYear = dataOfInterest[0][dateCol],
        chartHeight = height * (1 / countriesCount);

    dataOfInterest.forEach(function (d) {

        if (!maxDataPoint[d[countryCol]]) {

            maxDataPoint[d[countryCol]] = 0;
        }

        if (d[valueCol] > maxDataPoint[d[countryCol]]) {

            maxDataPoint[d[countryCol]] = d[valueCol];

        }

        d[dateCol] = parseDate(d[dateCol]);
    });

    //creating each chart
    for (var i = 0; i < countriesCount; i++) {
        charts.push(new Chart({
            data: dataOfInterest.slice(), // copy the array
            id: i,
            name: countries[i],
            width: width,
            height: height * (1 / countriesCount) - 7,
            maxDataPoint: maxDataPoint[countries[i]],
            svg: svg,
            margin: margin,
            showBottomAxis: (i == countries.length - 1)
        }));
    }

    //creating a brush for interaction
    var contextXScale = d3.time.scale()
        .range([0, contextWidth])
        .domain(charts[0].xScale.domain());

    var contextAxis = d3.svg.axis()
        .scale(contextXScale)
        .tickSize(contextHeight)
        .tickPadding(-10)
        .ticks(6)
        .orient("bottom").tickFormat(function (d) {
            return d3.time.format('%b')(new Date(d));
        });

    var contextArea = d3.svg.area()
        .interpolate("monotone")
        .x(function (d) {
            return contextXScale(d[dateCol]);
        })
        .y0(contextHeight)
        .y1(0);

    var brush = d3.svg.brush()
        .x(contextXScale)
        .on("brush", onBrush);

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + (margin.left + width * .025) + "," + (height + margin.top + chartHeight) + ")");

    context.append("g")
        .attr("class", "x axis top")
        .attr("transform", "translate(0,0)")
        .call(contextAxis);

    context.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", 0)
        .attr("height", contextHeight);

    context.append("text")
        .attr("class", "instructions")
        .attr("transform", "translate(0," + (contextHeight + 20) + ")")
        .text('Brush specific time period');

    function onBrush() {
        /* 
	this will return a date range to pass into the chart object 
	*/

        var b = brush.empty() ? contextXScale.domain() : brush.extent();

        for (var i = 0; i < countriesCount; i++) {
            charts[i].showOnly(b);
        }
    }
}

function Chart(options) {
    this.chartData = options.data;
    this.width = options.width;
    this.height = options.height;
    this.maxDataPoint = options.maxDataPoint;
    this.svg = options.svg;
    this.id = options.id;
    this.name = options.name;
    this.margin = options.margin;
    this.showBottomAxis = options.showBottomAxis;

    var localName = this.name;

    var actualData = this.actualData = this.chartData.filter(function (d) {
        if (d[countryCol] == localName) {
            return d;
        }
    });



    /* XScale is time based */
    this.xScale = d3.time.scale()
        .range([0, this.width])
        .domain(d3.extent(this.chartData.map(function (d) {
            return d[dateCol];
        })));

    /* YScale is linear based on the maxData Point we found earlier */
    this.yScale = d3.scale.linear()
        .range([this.height, 0])
        .domain([0, this.maxDataPoint]);


    var xS = this.xScale;
    var yS = this.yScale;

    this.area = d3.svg.area()
        .interpolate("basis")
        .x(function (d) {
            return xS(d[dateCol]);
        })
        .y0(this.height)
        .y1(function (d) {
            return yS(d[valueCol]);
        });

    this.svg.append("defs").append("clipPath")
        .attr("id", "clip-" + this.id)
        .append("rect")
        .attr("width", this.width)
        .attr("height", this.height);


    this.chartContainer = this.svg.append("g")
        .attr('class', this.name.toLowerCase())
        .attr("transform", "translate(" + this.margin.left + "," + (this.margin.top + (this.height * this.id) + (10 * this.id)) + ")");

    /* We've created everything, let's actually add it to the page */

    this.chartContainer.append("path")
        .data([actualData])
        .attr("class", "chart")
        .attr("clip-path", "url(#clip-" + this.id + ")")
        .attr("d", this.area);

    this.xAxisTop = d3.svg.axis()
        .scale(this.xScale).orient("bottom")
        .ticks(3)
        .tickFormat(function (d) {
            return d3.time.format('%b\'%y')(new Date(d));
        });

    //    this.xAxisBottom = d3.svg.axis()
    //        .scale(this.xScale).orient("top")
    //        .ticks(6)
    //        .tickFormat(function (d) {
    //            return d3.time.format('%b\'%y')(new Date(d));
    //       });;

    /* We only want a top axis if it's the first country */

    if (this.id == 0) {
        this.chartContainer.append("g")
            .attr("class", "x axis top")
            .attr("transform", "translate(0,-20)")
            .call(this.xAxisTop);
    }

    /* Only want a bottom axis on the last country */

    //    if (this.showBottomAxis) {
    //        this.chartContainer.append("g")
    //            .attr("class", "x axis bottom")
    //            .attr("transform", "translate(0," + this.height + ")")
    //            .call(this.xAxisBottom);
    //    }

    this.yAxis = d3.svg.axis().scale(this.yScale).orient("left").ticks(2);

    this.chartContainer.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(-15,0)")
        .call(this.yAxis);

    this.chartContainer.append("text")
        .attr("class", "country-title")
        .attr("transform", "translate(5,10)")
        .text(this.name);

}

Chart.prototype.showOnly = function (b) {
    this.xScale.domain(b);
    var actualData = this.actualData;
    this.chartContainer.select("path")
        .data([actualData])
        .attr("d", this.area);

    this.chartContainer.select(".x.axis.top").call(this.xAxisTop);
    //    this.chartContainer.select(".x.axis.bottom")
    //        .call(this.xAxisBottom);
}



function createVisualization(qrcontent) {


    if (!qrcontent) {
        smallMultiples();
        return;
    }

    qrcontent = JSON.parse(qrcontent);

    if (qrcontent.type == "country") {

        createRadialPlot();

    } else {
        smallMultiples();
    }
}