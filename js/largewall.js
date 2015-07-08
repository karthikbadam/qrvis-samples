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

    //link to open mobile app
    //making QR code 
    var qrcode = new QRGenerator({
        width: 100,
        height: 100,
        content: "http://www.terpconnect.umd.edu/~sbadam/qrvis/reader.html",
        frames: 1,
        qrdelay: 100,
        parentId: "charts",
        left: deviceWidth - 130,
        top: 30

    });


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

        console.log(ebc);
        console.log(ebd);
        createCountryBarChart();
        createTimeChart();

    });



});

function createCountryBarChart() {
    ebc = d3.entries(ebc);

    var width = deviceWidth * 0.7 - 200;
    var height = deviceHeight * 0.3;
    var barH = height / ebc.length;
    var offL = 200;

    var qrcontent = {};
    
    barplotSvg = d3.select("#charts")
        .append('svg')
        .attr('id', 'ebc')
        .attr('class', 'barchart')
        .attr('width', offL + width)
        .attr('height', height);

    qrcontent.type = "country";
    
    var x = d3.scale.linear()
        .domain([0, d3.max(ebc, function (d) {
            return d.value;
        })])
        .range([0, width - 50]);
    
    //qrcontent.xs = "linear";
    qrcontent.x = "value";

    var y = d3.scale.ordinal()
        .domain(ebc.map(function (d) {
            return d.key;
        }))
        .rangeBands([0, height]);
    
    //qrcontent.ys = "ordinal";
    qrcontent.y = "key";

    var bar = barplotSvg.selectAll("g")
        .data(ebc)
        .enter().append("g")
        .attr("transform", function (d, i) {
            return "translate(" + offL + "," + i * barH + ")";
        });
    
    qrcontent.viz = {};
    //qrcontent.viz.t = 'offL + "," + i*barH';

    bar.append("rect")
        .attr("width", function (d) {
            if (x(d.value) < 10) {
                return 3 + x(Math.pow(d.value, 1.8));
            }
            return x(d.value);
        })
        .attr("height", barH - 1);
    
    qrcontent.viz.grp = "rect";

    bar.append("text")
        .attr("x", function (d) {
            if (x(d.value) < 10) {
                return 10 + x(Math.pow(d.value, 1.8));
            }
            return x(d.value) + 10;
        })
        .attr("y", barH / 2)
        .attr("dy", ".35em")
        .text(function (d) {
            return d.value;
        });
    
    //qrcontent.viz.tick = "value";

    barplotSvg.selectAll("text.name")
        .data(ebc)
        .enter().append("text")
        .attr("x", offL - 10)
        .attr("y", function (d) {
            return y(d.key) + barH / 2;
        })
        .attr("dy", ".36em")
        .attr("text-anchor", "end")
        .attr('class', 'name')
        .text(function (d) {
            return d.key;
        });

    //qrcontent.viz.data = "ebc";
    //qrcontent.viz.axisTick = "key";

    //making QR code 

    var qrcode = new QRGenerator({
        width: 100,
        height: 100,
        content: JSON.stringify(qrcontent),
        frames: 2,
        qrdelay: 150,
        parentId: "ebc"

    });
}

function createTimeChart() {

    var qrcontent = {};

    ebd = d3.entries(ebd);

    ebd.sort(function (a, b) {
        if (parseDate(b.key) == parseDate(a.key)) return 0;
        if (parseDate(b.key) < parseDate(a.key)) return 1;
        return -1;
    });

    var margin = {
        top: 20,
        right: 60,
        bottom: 20,
        left: 100
    };

    var width = deviceWidth * 0.7 - margin.right - margin.left;
    var height = deviceHeight * 0.2 - margin.top - margin.bottom;

    timeplotSvg = d3.select("#charts")
        .append("svg")
        .attr('id', 'ebd')
        .attr('class', 'linechart')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    qrcontent.type = "time";

    var x = d3.time.scale()
        .range([0, width]);
    
    //qrcontent.xs = "time";

    var y = d3.scale.linear()
        .range([height, 0]);

    
    //qrcontent.ys = "linear";
    
    x.domain(d3.extent(ebd, function (d) {
        return parseDate(d.key);
    }));
    
    
    qrcontent.x = "key";

    y.domain(d3.extent(ebd, function (d) {
        return d.value;
    }));
    
    qrcontent.y = "value";

    //creates x and y axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom").ticks(8)
        .tickFormat(function (d) {
            return d3.time.format('%m/%d/%y')(new Date(d));
        });

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left").ticks(4);

    var area = d3.svg.area()
        .x(function (d) {
            return x(parseDate(d.key));
        })
        .y0(height)
        .y1(function (d) {
            return y(d.value);
        });
    
    qrcontent.viz = {};
    qrcontent.viz.grp = "area";

    timeplotSvg.append("defs")
        .append("clipPath").attr("id", "clip")
        .append("rect")
        .attr("width", width).attr("height", height);

    //draws the path line    
    chartContainer = timeplotSvg.append("g")
        .attr("class", "linechart")
        .attr("width", width).attr("height", height);

    chartContainer.append("path")
        .attr("class", "area")
        .data([ebd])
        .attr("d", area)
        .attr("fill-opacity", 0.7)
        .attr("stroke", "transparent")
        .attr("stroke-width", "2px");
    
     //qrcontent.viz.data = "ebd";

    //draws the axis   
    chartContainer.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    chartContainer.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", "5em")
        .attr("y", 20)
        .style("text-anchor", "end")
        .text("Cumulative number of victims");
    

    //making QR code 
    var qrcode = new QRGenerator({
        width: 100,
        height: 100,
        content: JSON.stringify(qrcontent),
        frames: 2,
        qrdelay: 150,
        parentId: "ebd"

    });
}