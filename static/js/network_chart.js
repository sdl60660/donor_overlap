// d3 = require("d3@5");

NetworkChart = function(_parentElement) {
    this.parentElement = _parentElement;

    this.initVis();
};


NetworkChart.prototype.initVis = function() {
    const vis = this;

    // Set height/width of viewBox
    vis.width = 1800;
    vis.height = 1200;

    // Initialize SVG
    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("viewBox", [0, 0, vis.width, vis.height]);


    // Initialize hover tooltip on nodes
    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d) {
            let outputString = '<div>';
            outputString += `<div style="text-align: center;"><span><strong>${d.display_name}</strong></span></div><br>`;
            outputString += `<span>Identified Donors:</span> <span style="float: right;">${d3.format(",")(d.total_donors)}</span><br>`;

            outputString += '</div>';

            return outputString
        });
    vis.svg.call(vis.tip);

    vis.minCircleRadius = 20;
    // Scales for node radius and with of line depending on overlap percentage
    vis.circleRadius = d3.scaleLinear()
        // .domain(d3.extent(overlapLinks, (d) => d.pct_val))
        .domain([10000, 1000000])
        .range([vis.minCircleRadius, 50]);

    vis.lineWidth = d3.scaleLinear()
        .domain(d3.extent(overlapLinks, (d) => d.pct_val))
        .range([0.5, 5]);


    vis.straightLink = vis.svg.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.6)
        .selectAll("line");

    // vis.curvedLink = vis.svg.append("g")
    //     .attr("fill", "none")
    //     .attr("stroke-opacity", 0.6)
    //     .selectAll("path");
    //
    // vis.hiddenLink = vis.svg.append("g")
    //     .attr("fill", "none")
    //     .selectAll("path");
    //
    // vis.linkText = vis.svg.append("g")
    //     .attr('id', 'textPaths')
    //     .selectAll("text");

    const defs = vis.svg
        .append("defs")
        .attr("id", "imgdefs");

    vis.candidateImages = defs
        .selectAll("pattern")
        .data(overlapNodes, (d) => d.id)
        .join("pattern")
        .attr("id", d => `network-image-${d.id}`)
        .attr("height", (d) => 1)
        .attr("width", (d) => 1)
        .attr("patternUnits", "objectBoundingBox")
        .append("image")
            .attr("class", "candidate-bubble-images")
            // .attr("id", d => d.id)
            .attr("x", 0)
            .attr("y", 0)
            .attr("xlink:href", d => `/static/images/candidate_images/${d.image_url}`);

    vis.images = vis.svg.append("g")
        .attr("class", "nodelink-images")
        .selectAll("circle.images");

    vis.nodes = vis.svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle");

    vis.wrangleData();
};

NetworkChart.prototype.wrangleData = function() {
    const vis = this;

    // vis.donorThreshold = 30000;
    // vis.overlapThreshold = 31;

    vis.nodeData = overlapNodes.slice()
        .filter(d => d.total_donors > minDonorCountNetwork);

    const includedCandidates = vis.nodeData.map(d => d.id);

    vis.selectedOverlapLinks = _.cloneDeep(overlapLinks.slice().filter( d => {
        return d.pct_val > overlapThresholdNewtork &&
            (includedCandidates.includes(d.target) && includedCandidates.includes(d.source));
    }));

    // Determine node layout (using multiple rings, if necessary)
    const linkDistance = 620;

    // vis.simulation = d3.forceSimulation(vis.overlapNodes)
    //     .force("charge", d3.forceManyBody().strength(-450))
    //     .force("charge", d3.forceCollide().radius(d => vis.circleRadius(d.radiusVal)))
    //     .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))
    //     .force("link", d3.forceLink(vis.selectedOverlapLinks).id(d => d.id).distance(linkDistance))
    //     // .force("r", d3.forceRadial(function(d,i) { return i > 40 ? linkDistance + 100 : linkDistance; }, vis.width / 2, vis.height /2))
    //     .stop();

    vis.updateVis();

};

NetworkChart.prototype.updateVis = function() {
    const vis = this;

    vis.simulation = d3.forceSimulation(vis.nodeData)
        .force('x', d3.forceX(d => d.party === "REP" ? vis.width*0.67 : vis.width*0.33).strength(0.03))
        // .force('x', d3.forceX(vis.width / 2).strength(0.035))
        // .force('centerX', d3.forceX(vis.width / 2).strength(0.02))
        .force('y', d3.forceY(vis.height / 2).strength(0.04))
        .force("link", d3.forceLink(vis.selectedOverlapLinks).id((d) => d.id).distance(d => 350 - 3*d.pct_val).strength(d => d.pct_val / 500))
        .force("repelForce", d3.forceManyBody().strength(-300).distanceMax(450))
        .force("charge", d3.forceCollide().radius((d) => vis.circleRadius(d.total_donors) + 2).iterations(2))
        .force("center", d3.forceCenter(vis.width / 2, vis.height / 2));



    const transitionDuration = 800;

    vis.straightLink = vis.straightLink
        .data(vis.selectedOverlapLinks, (d) => [d.source, d.target])
        .join(
            enter => enter.append("line")
                .style("z-index", 1)
                .attr("class", d => `straight-link link-${d.source.id} link-${d.target.id}`)
                .attr("stroke", "#333")
                .attr("stroke-width", d => vis.lineWidth(d.pct_val)),
                // .attr("x1", vis.width/2)
                // .attr("y1", vis.height/2)
                // .attr("x2", vis.width/2)
                // .attr("y2", vis.height/2)
                // .call(enter => enter.transition()
                //     .duration(transitionDuration)
                //     .attr("x2", d => d.initialX2)
                //     .attr("y2", d => d.initialY2)
                // ),
            // update => update
            //     .transition()
            //     .duration(transitionDuration)
            //         .attr("x2", d => d.initialX2)
            //         .attr("y2", d => d.initialY2)

            exit => exit.remove()
        );


    vis.svg.selectAll(".candidate-bubble-images")
        .attr("height", (d) => 2*vis.circleRadius(d.total_donors))
        .attr("width", (d) => 2*vis.circleRadius(d.total_donors));


    vis.images = vis.images
        .data(vis.nodeData, (d) => d.id)
        .join(
            enter => enter.append("circle")
                .attr("class", "candidate-images images")
                .attr("r", d => vis.circleRadius(d.total_donors))
                .style("fill", d => `url(#network-image-${d.id})`),

            update => update
                .transition()
                    .duration(transitionDuration)
                    .attr("r", d => vis.circleRadius(d.total_donors)),

            exit => exit.remove()
        );

    vis.nodes = vis.nodes
        .data(vis.nodeData, (d) => d.id)
        .join(
            enter => enter.append("circle")
                .attr("class", "candidate-node")
                .attr("fill", (d) => partyColor(d.party))
                .attr("fill-opacity", 0.1)
                .style("z-index", 10)
                .attr("r", d => vis.circleRadius(d.total_donors))
                .on("mouseover", (d) => {
                    vis.tip.show(d);

                    if (d.id !== vis.centerNodeId) {
                        vis.svg.selectAll(".straight-link")
                            .style("opacity", 0);

                        vis.svg.selectAll(`.link-${d.id}`)
                            .style("opacity", 1);
                    }

                })
                .on("mouseout", (d) => {
                    vis.tip.hide();

                    vis.svg.selectAll(".straight-link")
                        .style("opacity", 1);

                })
                // .on("dblclick", (d) => {
                // .on("dblclick", (d) => {
                //     $("#overlap-nodelink-candidate-select").val(d.id);
                //     document.querySelector("#overlap-nodelink-candidate-select").fstdropdown.rebind();
                //     featuredCandidateId = d.id;
                //     // vis.simulation.stop();
                //     vis.wrangleData();
                // })
                .attr("cx", vis.width/2)
                .attr("cy", vis.height/2)
                .attr("x", vis.width/2)
                .attr("y", vis.height/2)
                .style("stroke-width", 4)
                .style("stroke", d => partyColor(d.party))
                .call(drag(vis.simulation)),

            update => update.transition()
                .duration(transitionDuration)
                .attr("r", d => vis.circleRadius(d.total_donors)),


            exit => exit.remove()


        );

    vis.simulation.on("tick", () => {
        vis.straightLink
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        vis.nodes
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        vis.images
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        });

    vis.simulation
        .restart();

};


drag = simulation => {

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}