var svg = d3.select('body').append('svg')
  .attr('width', 960)
  .attr('height', 600);

var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-8))
    .force("center", d3.forceCenter(width / 2, height / 2));

var randomSize = d3.randomUniform(5, 10);
var randomThickness = d3.randomUniform(1,5);

var color = d3.scaleOrdinal().range(['#d7191c', '#f9d057', '#90eb9d', '#f29e2e', '#00ccbc', '#d7191c', '#f0d057'])

d3.queue()
  .defer(d3.csv, "datalabel.csv")
  .defer(d3.csv, "graphdata.csv")
  .await(analyze);

function analyze(error, nodes, links) {
  if (error) throw error;
  
  // graph.links.forEach(function(d){
  //   d.source = d.source_id;    
  //   d.target = d.target_id;
  // });      

  var linkedNodesIDs = new Set();

  links.forEach(function(d){
    linkedNodesIDs.add(d.source);
    linkedNodesIDs.add(d.target);
  })   

  var linkedNodes = [];

  nodes.forEach(function(d){
    if ( linkedNodesIDs.has(d.id) ){
      linkedNodes.push(d)
    }
  });

  console.log(linkedNodes);

  var link = svg.append("g")
                .style("stroke", "#aaa")
                 .selectAll("line")
                .data(links)
                .enter().append("line")
                  .style("stroke-width", function(){ return randomThickness()} )
               

  var node = svg.append("g")
            .attr("class", "nodes")
  .selectAll("circle")
            .data(linkedNodes)
  .enter().append("circle")
          .attr("r", function(){return randomSize() })
          .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended)); 

  node
    .data(linkedNodes)
    .append("title")
        .text(function(d){ return d.name });

  var label = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(linkedNodes)
      .enter().append("text")
        .attr("class", "label")
        .text(function(d) { return d.name; })
        .style("fill", "#666")
        .style("font-size", randomSize() )

  simulation
      .nodes(nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .style("stroke", function(d, i){ return color(i) })
        .style("stroke-opacity", 0.2);

    node
         // .attr("r", randomSize() )
         .style("fill", function(d, i){ return color(i) })
         .style("fill-opacity", 0.5)
         // .style("stroke", function(d, i){ return color(i) })
         // .style("stroke-width", "1px")
         .attr("cx", function (d) { return d.x+2; })
         .attr("cy", function(d) { return d.y-2; });
    
    label
        .attr("x", function(d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            // .style("fill", "#4393c3");
  }
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart()
  simulation.fix(d);
}

function dragged(d) {
  simulation.fix(d, d3.event.x, d3.event.y);
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  simulation.unfix(d);
}
