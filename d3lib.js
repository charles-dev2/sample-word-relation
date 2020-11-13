((global) => {
  const d3 = global.d3;
  const lib = (global.lib = global.lib || {});
  const func = global.lib.func || {};
  const d3lib = (lib.d3lib = lib.d3lib || {});

  const config = (d3lib.config = d3lib.config || {});

  const margin = (config.margin = {
    top: 20,
    bottom: 50,
    right: 30,
    left: 50,
  });

  const width = (config.width = 1500 - margin.left - margin.right);
  const height = (config.height = 1000 - margin.top - margin.bottom);

  let svg = (config.svg = d3.select("body").append("svg"));
  console.log(svg);
  global.temp = svg;

  svg
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("width", width)
    .style("height", height);

  const utils = (d3lib.utils = d3lib.utils || {});

  const getRadiusFromCount = (utils.getRadiusFromCount = (count) =>
    Math.max(Math.round(count / 100), 5));

  const getStrokeWidthFromRelation = (utils.getStrokeWidthFromRelation = (
    relation
  ) => Math.max(Math.round(relation), 2));

  const getFontSizeFromCount = (utils.getFontSizeFromCount = (count) =>
    Math.max(Math.round(count / 60), 9));

  const clearCanvas = (d3lib.clearCanvas = (simulation) => {
    (simulation || { stop: () => {} }).stop();
    svg.selectAll(".links").remove();
    svg.selectAll(".nodes").remove();
  });

  const draw = (d3lib.draw = (dataset, currentWord, queryingWord) => {
    if (svg.nodes().length < 1) {
      svg = config.svg = d3.select("body").append("svg");
      svg
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("width", width)
        .style("height", height);
    }
    console.log(dataset);

    const { createNode, createLink } = func;

    const { nodes, links } = {
      nodes: dataset.nodes.map(createNode),
      links: dataset.links.map(createLink),
    };

    const baseNode = dataset.nodes.find((e) => e.word === currentWord);

    const dragstarted = (d3event, d) => {
      if (!d3event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (d3event, d) => {
      d.fx = d3event.x;
      d.fy = d3event.y;
    };

    const dragended = (d3event, d) => {
      if (!d3event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    const simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id((d) => d.id)
          .distance(25)
      )
      .force(
        "collide",
        d3
          .forceCollide(
            (d) => Math.max(Number.parseInt(d.count / 100, 10), 0) + 3
          )
          .iterations(16)
      )
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("y", d3.forceY(0))
      .force("x", d3.forceX(0));

    var link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "grey")
      .attr("stroke-width", (d) => getStrokeWidthFromRelation(d.relation))
      .attr("opacity", (d) => {
        if (baseNode) {
          if (d.source === baseNode.id || d.source.id === baseNode.id) {
            return 1;
          }
        }
        return 0.05;
      });

    var node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "element")
      .attr("nid", (d) => d.id)
      .attr("opacity", (d) => {
        if (baseNode) {
          if (d.id === baseNode.id) {
            return 1;
          }
          const related = dataset.links
            .filter(({ source }) => source === baseNode.id)
            .map(({ target }) => target);
          if (related.includes(d.id)) {
            return 1;
          }
        }
        return 0.2;
      });

    node.call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    var circle = node
      .append("circle")
      .attr("class", "circles")
      .attr("fill", d3.schemeCategory10[0])
      .attr("stroke", d3.schemeCategory10[0])
      .attr("r", (d) => getRadiusFromCount(d.count))
      .on("click", (evt, d) => {
        if (currentWord !== d.word) {
          clearCanvas(simulation);
          queryingWord(d.word);
        }
      });

    var label = node
      .append("text")
      .attr("dx", (d) => 0)
      .attr("dy", (d) => getRadiusFromCount(d.count))
      .attr("font-size", (d) => getFontSizeFromCount(d.count))
      .text((d) => d.word)
      .on("click", (evt, d) => {
        if (currentWord !== d.word) {
          clearCanvas(simulation);
          queryingWord(d.word);
        }
      });

    var ticked = function () {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      circle
        .attr("fill", d3.schemeCategory10[0])
        .attr("stroke", d3.schemeCategory10[0])
        .attr("r", (d) => getRadiusFromCount(d.count));

      label
        .attr("dx", (d) => 0)
        .attr("dy", (d) => getRadiusFromCount(d.count))
        .attr("font-size", (d) => getFontSizeFromCount(d.count));

      // node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    };

    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(links);
  });
})(this);
