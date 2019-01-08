var initTree = function(){


//defining the chart
var myChart = familyChart().nodes(nodes)
                           .links(edges);

//defining the width and height of the svg
var width = window.innerWidth, // default width
   height = window.innerHeight;

var draw_size = 0.75;
var height_draw = 100*draw_size;
var width_draw = 80*draw_size;
//drawing the svg and calling the familyChart opject.

var svg = d3.select('#forces').append("svg")
            .attr("width", width)
            .attr("height", height)
             // .attr("xmlns", "http://www.w3.org/2000/svg")
            // .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
            .call(myChart);

function familyChart() {


  var nodes = [],
      links = [] // default height

  function my(svg) {

    //set the radius of the family nodes
    var family_radius = 15;

    //set the repel force - may need to be tweaked for multiple data
    //the lower the strength the more they will repel away from each other
    //the larger the distance, the more apart they will be
     var repelForce = d3.forceManyBody().strength(-5000).distanceMax(450)
                       .distanceMin(85);

    //start the simulation
    //alpha decay - if less, force takes longer but is better positioned
    //center just keeps everything in the svg - otherwise you won't see it however much you pan or zoom
    //repel force see above
    //link distance - repel takes precidence - try upping or lowering the strength and changing the distances
    //collide - this is on maximum strength and is higher for family (bigger radius) than others so should keep
    //families further apart than people
    var simulation = d3.forceSimulation()
                  //     .alphaDecay(0.04)
                  //     .velocityDecay(0.4)
                  //     .force("center", d3.forceCenter(width / 2, height / 2))
                       .force("xAxis",d3.forceX(width/2).strength(0.4))
                       .force("yAxis",d3.forceY(height/2).strength(0.6))
                       .force("repelForce",repelForce)
                       .force("link", d3.forceLink().id(function(d) { return d.id }).distance(dist).strength(1.5))
                       .force("collide",d3.forceCollide().radius(function(d) { return d.r * 20; }).iterations(10).strength(1))

    function dist(d){
      //used by link force
      return 100

    }
    simulation.alphaTarget(0).restart();

    //define the links
    var links = svg.selectAll("foo")
        .data(edges)
        .enter()
        .append("line")
        .attr("stroke-width",function(d){
          //stroke width - thicker if married/divorced
            if(d.type == 'married' || d.type =='divorced'){
              return "4px"
            } else{
              return "0.5px"
            }})
        .attr("stroke-dasharray", function(d){ //dashed if divorced
          if(d.type == 'divorced'){
            return "6,6"
          } else{
            return "0"
          }
        })
      .attr("stroke", function(d){  //grey unless adopted (blue) or married/divorced (gold) or married_invisible (white)
        if(d.type == 'married' || d.type=="divorced"){
          return "#2DB674"
        } else if(d.type=='adopted'){
          return "#2DB674"
        } else if(d.type=='married_invisible'){
          return "#2DB674"
        } else {
          return "#2DB674"
        }
      });

    //define tooltip
    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .html("");

      //draw the nodes with drag functionality
      var node = svg.selectAll("foo")
          .data(nodes)
          .enter()
          .append("g")
          .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

    //define defs and patterns - for the images
    var defs = node.append("defs");


    var allDeftRect= defs.append('pattern')
        .attr("id", function(d,i){return "my_image" + i})
        .attr("width", 1)
        .attr("height", 1);

    allDeftRect.append('rect')
        .attr("fill","white")
        .attr("height", height_draw)
        .attr("width", width_draw);

    allDeftRect.append("svg:image")
        .attr("xlink:href", function(d) {return d.image})
        .attr("height", height_draw)
        .attr("width", width_draw)
        .attr("x", 0)
        .attr("y", 0);

        //append deceased arc - only visible if "dead" is defined
        node.append('path')
            .attr('class',"semi-circle")
            .attr('fill','none')
            .attr('stroke','#2DB674')
            .attr('stroke-width', function(d){
              if(d.dead == undefined){return "0px"
              }else{return "4px"}})
            .attr('d',describeArc(0, -2.5, 12.5, -90, 90))

    //append circles

    var dots = node.filter(function(d) { return d.type == "family"; }).append("circle")
                      .attr("class","circle")
                      .attr("r",family_radius)
                       .attr("fill",function(d,i){ //white if family, otherwise image
                         if(d.type == "family"){return "#4570B6"}
                         else{return "url(#my_image" + i + ")"}})
                        .attr("stroke", "#4570B6")
                          .attr("stroke-width","4px");

    var circles = node.filter(function(d) { return d.type != "family"; }).append("rect")
                      .attr("class","circle")
                      .attr('x',-40)
                      .attr('y',-40)
                      .attr("width", function(d){ //radius - bigger if family
                          if (d.type == "family"){
                            return family_radius;
                          } else{return width_draw;}})
                      .attr("height", function(d){ //radius - bigger if family
                          if (d.type == "family"){
                            return family_radius;
                          } else{return height_draw;}})
                       .attr("fill",function(d,i){ //white if family, otherwise image
                         if(d.type == "family"){return "#4570B6"}
                         else{return "url(#my_image" + i + ")"}})
                        .attr("stroke", function(d){
                          //different borders for family, male and female
                          if (d.type == "family"){return "#4570B6";
                          } else { if(d.sex == "m"){return "#4570B6"
                          } else {  return "#C73D62"}}})
                          .attr("stroke-width","2px")
                          .on("mouseover", function(d){
                            if(d.type !== "family"){
                              //sets tooltip.  t_text = content in html
                              t_text = "<strong>" + titleCase(d.name) + "</strong><br>" + d.relationBase.relationType
                              if(d.profession !== undefined){
                                //only add profession if it is defined
                                t_text += "<br>de " + d.relationBase.source}
                              tooltip.html(t_text)
                              return tooltip.style("visibility", "visible");
                            }  })
                           .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
                           .on("mouseout", function(){return tooltip.style("visibility", "hidden");});


    //title case function used by tooltip and labels
    function titleCase(str) {
        str = str.toLowerCase().split(' ');
        for (var i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }
        return str.join(' ');
    }

    //append labels
    var texts = node.append("text")
        .style("fill", "black")
        .attr("dx", -8)
        .attr("dy", 50)
        .attr("text-anchor","middle")
        .text(function(d) {
            return titleCase(d.name);
        });

    //finally - attach the nodes and the links to the simulation
    simulation.nodes(nodes);
    simulation.force("link")
              .links(edges);

    //and define tick functionality
   simulation.on("tick", function() {
        simulation.alphaTarget(0).restart();
        links.attr("x1", function(d) {return d.source.x;})
             .attr("y1", function(d) {return d.source.y;})
             .attr("x2", function(d) {return d.target.x;})
             .attr("y2", function(d) {return d.target.y;})

        node.attr("transform", function(d){ return "translate(" + d.x + "," + d.y + ")"})
    });


    function dragstarted(d) {

       if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      if(d.type == 'family'){
        //stickiness - toggles the class to fixed/not-fixed to trigger CSS
        var my_circle = d3.select(this).selectAll('circle')
        // if(my_circle.attr('class') == 'fixed'){
        //   my_circle.attr("class","not-fixed")
        // }else{
          my_circle.attr("class","fixed")
        // }
      }
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
      simulation.alphaTarget(0).restart();
       // if (!d3.event.active) simulation.alphaTarget(0);
       // //stickiness - unfixes the node if not-fixed or a person
       // var my_circle = d3.select(this).selectAll('circle')
       // if(my_circle.attr('class') == 'not-fixed'  || d.type !== 'family'){
       //   d.fx = null;
       //   d.fy = null;
       // }
 
    }
  
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      //for arcs - from excellent link - http://jsbin.com/quhujowota/1/edit?html,js,output
        var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }

    function describeArc(x, y, radius, startAngle, endAngle){
      //for arcs - from excellent link - http://jsbin.com/quhujowota/1/edit?html,js,output

        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);

        var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        var d = [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");

        return d;
    }


  }

  my.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return my;
  };

  my.nodes = function(value) {
    if (!arguments.length) return nodes;
    nodes = value;
    return my;
  };

  my.links = function(value) {
    if (!arguments.length) return links;
    links = value;
    return my;
  };

  my.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return my;
  };

  return my;
}




}


