const svgWidth = 825
const svgHeight = 700

let margin = {
  top: 50,
  right: 50,
  bottom: 100,
  left: 100
}

let width = svgWidth - margin.left - margin.right
let height = svgHeight - margin.top - margin.bottom

let svg = d3
  .select("#scatter")
  .classed("chart", true)
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

let chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

// View selection - changing this triggers transition
let xSelection = "poverty",
    ySelection = "healthcare"

/**
 * Returns a updated scale based on the current selection.
 **/
function xScale(data, xSelection) {
  let xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, d => d[xSelection]) * 0.8,
      d3.max(data, d => d[xSelection]) * 1.2
    ])
    .range([0, width])

  return xLinearScale
}

function yScale(data, ySelection) {
  let yLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, d => d[ySelection]) * 0.8,
      d3.max(data, d => d[ySelection]) * 1.2
    ])
    .range([height, 0])

  return yLinearScale
}

/**
 * Returns and appends an updated x-axis based on a scale.
 **/
function renderXAxes(xLinearScale, xAxis) {
  let bottomAxis = d3.axisBottom(xLinearScale)

  xAxis
    .transition()
    .duration(1000)
    .call(bottomAxis)

  return xAxis
}

function renderYAxes(yLinearScale, yAxis) {
  let leftAxis = d3.axisLeft(yLinearScale)

  yAxis
    .transition()
    .duration(1000)
    .call(leftAxis)

  return yAxis
}

/**
 * Returns and appends an updated circles group based on a new scale and the currect selection.
 **/
function renderXCircles(circlesGroup, xLinearScale, xSelection) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", d => xLinearScale(d[xSelection]))

  return circlesGroup
}

function renderXText(circlesText, xLinearScale, xSelection) {
  circlesText
    .transition()
    .duration(1000)
    .attr("x", d => xLinearScale(d[xSelection]))

  return circlesText
}

function renderYCircles(circlesGroup, yLinearScale, ySelection) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cy", d => yLinearScale(d[ySelection]))

  return circlesGroup
}

function renderYText(circlesText, yLinearScale, ySelection) {
  circlesText
    .transition()
    .duration(1000)
    .attr("y", d => yLinearScale(d[ySelection]))

  return circlesText
}

function ToolTip(ySelection,xSelection,circlesGroup,circlesText) {
  let toolTip = d3.tip()
      .attr('class','tooltip')
      .offset([80, -60])
      .html( d => {
        
        if(xSelection === "poverty")
            return (`${d.state}<br>${ySelection}:${d[ySelection]}% 
                 <br>${xSelection}:${d[xSelection]}%`)
        else if (xSelection === "income")
            return (`${d.state}<br>${ySelection}:${d[ySelection]}% 
                <br>${xSelection}:${d[xSelection]}`)
        else
          return (`${d.state}<br>${ySelection}:${d[ySelection]}% 
                <br>${xSelection}:${d[xSelection]}`)
          })

      circlesGroup.call(toolTip)
      circlesGroup.on('mouseover', toolTip.show).on('mouseout', toolTip.hide)

      
      d3.selectAll('.circlesText').call(toolTip)
      d3.selectAll('.circlesText').on('mouseover', toolTip.show).on('mouseout', toolTip.hide)

      return circlesText
      

}


;(function() {
  d3.csv("assets/data/data.csv").then(data => {
    data.forEach( d =>{
      d.poverty = +d.poverty;
      d.age = +d.age;
      d.income = +d.income;
      d.obesity = +d.obesity;
      d.smokes = +d.smokes;
      d.healthcare = +d.healthcare;
    })

    let xLinearScale = xScale(data, xSelection)
    let yLinearScale = yScale(data,ySelection)

    let bottomAxis = d3.axisBottom(xLinearScale)
    // console.log(bottomAxis)
    let leftAxis = d3.axisLeft(yLinearScale)

    xAxis = chartGroup
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis)

    leftAxis = chartGroup.append('g')
      .call(leftAxis)

    chartGroup.append("text")
      .attr("transform", `translate(${width - 110},${height - 5})`)
      .attr("class", "axis-text-main")
      .text("Demographics")

    chartGroup.append("text")
      .attr("transform", `translate(17,170)rotate(270)`)
      .attr("class", "axis-text-main")
      .text("Behavioral Risk Factors")

    let circlesGroup = chartGroup
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[xSelection]))
      .attr("cy", d => yLinearScale(d[ySelection]))
      .attr("r", 13)
      .attr("fill", "green")
      .attr("opacity", ".5")

    let circlesText = chartGroup
      .append('g')
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .classed('circlesText',true)
      .attr('x', d => xLinearScale(d[xSelection]))
      .attr('y', d => yLinearScale(d[ySelection]))
      .style("font-size", "13px")
      .style("text-anchor", "middle")
      .style('fill', 'white')
      .attr('transform','translate(0,4.5)')
      .text(d => d.abbr)

    let xlabelsGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`)

    let povertylabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("In Poverty (%)")

    let agelabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age (Median)")

    let incomelabel = xlabelsGroup
      .append('text')
	    .attr('x', 0)
	    .attr('y', 60)
	    .attr('value', 'income')
	    .classed('inactive', true)
	    .text('Household Income (Median)')

    let ylabelsGroup = chartGroup
      .append("g")
      
    let healthcarelabel = ylabelsGroup
      .append("text")
      .attr("transform", `translate(-40,${height / 2})rotate(-90)`)
      .attr('value', 'healthcare')
      .classed("active", true)
      .text("Lacks Healthcare (%)")

    let smokeslabel = ylabelsGroup
      .append('text')
      .attr("transform", `translate(-60,${height / 2})rotate(-90)`)
      .attr('value', 'smokes')
      .classed('inactive', true)
      .text('Smokes (%)')

    let obeselabel = ylabelsGroup
      .append('text')
      .attr("transform", `translate(-80,${height / 2})rotate(-90)`)
      .attr('value', 'obesity')
      .classed('inactive', true)
      .text('Obese (%)')
    
    circlesText = ToolTip(ySelection,xSelection,circlesGroup,circlesText)

    // Crate an event listener to call the update functions when a label is clicked
    xlabelsGroup.selectAll("text").on("click", function() {
      let value = d3.select(this).attr("value")
      if (value !== xSelection) {
        xSelection = value
        xLinearScale = xScale(data, xSelection)
        xAxis = renderXAxes(xLinearScale, xAxis)

        circlesGroup = renderXCircles(
          circlesGroup,
          xLinearScale,
          xSelection
        )

        circlesText= renderXText(
          circlesText,
            xLinearScale,
            xSelection
        )

        circlesText = ToolTip(ySelection,xSelection,circlesGroup,circlesText)
        
        if (xSelection === 'poverty') {
          povertylabel
                .classed('active', true)
                .classed('inactive', false);
          incomelabel
                .classed('active', false)
                .classed('inactive', true);
          agelabel
                .classed('active', false)
                .classed('inactive', true);
          }
        else if (xSelection === 'age'){
          povertylabel
                .classed('active', false)
                .classed('inactive', true);
          incomelabel
                .classed('active', false)
                .classed('inactive', true);
          agelabel
                .classed('active', true)
                .classed('inactive', false);
          }
        else {
          povertylabel
                .classed('active', false)
                .classed('inactive', true);
          incomelabel
                .classed('active', true)
                .classed('inactive', false);
          agelabel
                .classed('active', false)
                .classed('inactive', true);
          }
        
      }
    })

    ylabelsGroup.selectAll("text").on("click", function() {
      let value = d3.select(this).attr("value")
      if (value !== ySelection) {
        ySelection = value
        yLinearScale = yScale(data, ySelection)
        leftAxis = renderYAxes(yLinearScale, leftAxis)
        circlesGroup = renderYCircles(
          circlesGroup,
          yLinearScale,
          ySelection
        )
        circlesText = renderYText(
          circlesText,
            yLinearScale,
            ySelection
        )

				circlesText = ToolTip(ySelection,xSelection,circlesGroup,circlesText)
        
        if (ySelection === 'healthcare') {
          healthcarelabel
                .classed('active', true)
                .classed('inactive', false);
          smokeslabel
                .classed('active', false)
                .classed('inactive', true);
          obeselabel
                .classed('active', false)
                .classed('inactive', true);
          }
        else if (ySelection === 'obesity'){
           healthcarelabel
                .classed('active', false)
                .classed('inactive', true);
          smokeslabel
                .classed('active', false)
                .classed('inactive', true);
          obeselabel
                .classed('active', true)
                .classed('inactive', false);
          }
        else {
          healthcarelabel
                .classed('active', false)
                .classed('inactive', true);
          smokeslabel
                .classed('active', true)
                .classed('inactive', false);
          obeselabel
                .classed('active', false)
                .classed('inactive', true);
          }

      }
    }

    )
  }
  )
})()
