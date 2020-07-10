class Graph {

    constructor(width, height, margin) {

        self.width = width - margin.left - margin.right;
        self.height = height - margin.top - margin.bottom;

        self.svg = d3.select("#aq-stat-graph")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }
}