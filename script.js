async function draw(el) {
  // Data
  const data = await d3.json(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
  );

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const dataset = data.monthlyVariance;

  // Dimensions
  const dimensions = {
    width: 800, //1400
    height: 500,
    margin: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 60
    }
  };

  // Draw Image
  const svg = d3
    .select(el)
    .append("svg")
    .attr(
      "width",
      dimensions.width + dimensions.margin.left + dimensions.margin.right
    )
    .attr(
      "height",
      dimensions.height + dimensions.margin.top + dimensions.margin.bottom
    );

  // Title
  svg
    .append("text")
    .attr("x", dimensions.width / 2 + dimensions.margin.left)
    .attr("y", dimensions.margin.top - 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .attr("id", "title")
    .text("Monthly Global Land-Surface Temperature");

  svg
    .append("text")
    .attr("x", dimensions.width / 2 + dimensions.margin.left)
    .attr("y", dimensions.margin.top - 5)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .attr("id", "description")
    .text(
      `${d3.min(dataset, (d) => d.year)} - ${d3.max(
        dataset,
        (d) => d.year
      )}: base temperature ${data.baseTemperature}℃`
    );

  // Scales
  const colorScale = d3
    .scaleQuantize()
    .domain(d3.extent(dataset, (d) => d.variance))
    .range([
      "#4575B4",
      "#74ADD1",
      "#ABD9E9",
      "#E0F3F8",
      "#FFFFBF",
      "#FEE090",
      "#FDAE61",
      "#F46D43",
      "#D73027"
    ]);

  const xScale = d3
    .scaleLinear()
    .domain([d3.min(dataset, (d) => d.year), d3.max(dataset, (d) => d.year)])
    .range([dimensions.margin.left, dimensions.width + dimensions.margin.left]);

  const yScale = d3
    .scaleBand()
    .domain(d3.range(1, 13))
    .range([dimensions.margin.top, dimensions.height + dimensions.margin.top]);

  // Tooltip
  const tooltip = d3
    .select("#chart")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", "0")
    .attr("data-date", "");

  // Legend
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr(
      "transform",
      `translate(${dimensions.margin.left}, ${
        dimensions.height + dimensions.margin.top + 20
      })`
    );

  // Legend scale
  const legendScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, (d) => d.variance))
    .range([0, dimensions.width]);

  // Legend rectangles
  legend
    .selectAll("rect")
    .data(colorScale.range())
    .join("rect")
    .attr("x", (d, i) => i * 30 )
    .attr("y", 0)
    .attr("width", 30)
    .attr("height", 18)
    .attr("fill", (d) => d);

 // Legend text labels
const legendTextValues = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];
legend
  .selectAll("text")
  .data(legendTextValues)
  .join("text")
  .attr("x", (d, i) => i * 30 )
  .attr("y", 30)
  .text((d) => d.toFixed(1))
  .style("text-anchor", "middle");

// Add bars above the legend text labels
legend
  .selectAll(".bar")
  .data(legendTextValues.slice(0, -1))
  .join("rect")
  .attr("class", "bar")
  .attr("x", (d, i) => i * 30 - 1)
  .attr("y", 17)
  .attr("width", 30)
  .attr("height", 1)
  .attr("fill", "black");
  
  legend
  .selectAll(".tick")
  .data(legendTextValues)
  .join("line")
  .attr("class", "tick")
  .attr("x1", (d, i) => i * 30 )
  .attr("y1", 17)
  .attr("x2", (d, i) => i * 30 )
  .attr("y2", 20)
  .attr("stroke", "black");

  // Rectangles
  const squares = svg
    .append("g")
    .classed("squares", true)
    .selectAll("rect")
    .data(dataset)
    .join("rect")
    .attr("class", "cell")
    .attr("width", 6)
    .attr("height", yScale.bandwidth())
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month))
    .attr("data-month", (d) => d.month - 1)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => d.variance)
    .attr("fill", (d) => colorScale(d.variance))
    .on("mouseover", (event, d) => {
      const tooltip = d3.select("#tooltip");
      tooltip.html(
        `
          ${d.year} - ${monthNames[d.month - 1]}
          <br/>
          Temperature: ${(data.baseTemperature + d.variance).toFixed(2)}℃
        `
      );
      tooltip.attr("data-year", d.year);

      const chartPosition = d3.select("#chart").node().getBoundingClientRect();
      const xPosition = event.pageX - chartPosition.left + 30;
      const yPosition =
        event.pageY - chartPosition.top - tooltip.node().offsetHeight + 50;

      tooltip
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .style("opacity", 1);
    })
    .on("mouseout", () => {
      d3.select("#tooltip").style("opacity", 0);
    });

  // Add X Axis (Years)
  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat(d3.format("d"))
    .tickSizeOuter(0);
  svg
    .append("g")
    .attr(
      "transform",
      `translate(0, ${dimensions.height + dimensions.margin.top})`
    )
    .call(xAxis)
    .attr("id", "x-axis")
    .selectAll("text")
    .style("text-anchor", "middle");

  // Add Y Axis (Months)
  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(d3.range(1, 13))
    .tickFormat((d, i) => monthNames[i])
    .tickSizeOuter(0);
  svg
    .append("g")
    .attr("transform", `translate(${dimensions.margin.left}, 0)`)
    .call(yAxis)
    .attr("id", "y-axis")
    .select(".domain")
    .style("stroke", "none");
}

draw("#chart");
