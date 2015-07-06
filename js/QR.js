function QRGenerator(options) {

    var _self = this;

    _self.width = options.width;

    _self.height = options.height;

    _self.qrdelay = options.qrdelay;

    _self.frames = options.frames;

    _self.content = options.content;

    _self.parentId = options.parentId;
    

    $("#qr-" + _self.parentId).remove();
    $("#qrdiv-" + _self.parentId).remove();

    d3.select("body").append("div")
        .attr("id", "qrdiv-" + _self.parentId);

    //put content into qr code. 
    qrvis.generate("qr-" + _self.parentId, "qrdiv-" + _self.parentId, _self.frames, _self.content, _self.width, _self.height, _self.qrdelay);

    var offset = $("#" + _self.parentId).offset();

    var parentWidth = $("#" + _self.parentId).width();
    var parentHeight = $("#" + _self.parentId).height();

    var offsetx = offset.left + parentWidth - 90;
    var offsety = offset.top + 20;

    d3.select("#qr-" + _self.parentId)
        .style("position", "relative");
    
    
    if (options.left && options.top) {
        offsetx = options.left;
        offsety = options.top;
    }

    d3.select("#qrdiv-" + _self.parentId)
        .attr("class", "qrdiv")
        .style("position", "absolute")
        .style("left", offsetx + "px")
        .style("top", offsety + "px");

    $("#qrdiv-" + _self.parentId).draggable();

}