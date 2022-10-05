import * as d3 from "d3";

export function renderNetwork(
  svgElement: SVGSVGElement,
  width: number,
  height: number,
  data: {
    nodes: { id: string; name: string }[];
    links: { source: string; target: string }[];
  },
  onNodeSelected?: (nodeId: string) => void
) {
  return new Promise<void>((resolve) => {
    svgElement.innerHTML = "";

    const svg = d3.select(svgElement);

    const root = svg.append("g");

    const zoom = d3.zoom().on("zoom", (e) => {
      root.attr("transform", e.transform);
    });

    svg.call(zoom as any);

    const links = root
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .style("stroke", "#aaa");

    const nodes = root
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("g")
      .on("click", (e, d) => onNodeSelected?.(d.id));

    nodes.append("circle").attr("r", 20).style("fill", "#69b3a2");

    nodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("fill", "white")
      .attr("paint-order", "stroke")
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .text((d) => d.name);

    d3.forceSimulation(data.nodes as any)
      .force(
        "link",
        d3
          .forceLink()
          .id((d: any) => d.id)
          .links(data.links)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("end", () => {
        updateNodes();
        resolve();
      });

    function updateNodes() {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodes.attr("transform", (d: any) => `translate(${d.x + 6},${d.y + 6})`);
    }
  });
}
