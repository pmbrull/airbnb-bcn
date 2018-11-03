/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function() {

  // constants to define the size
  // and margins of the vis area.
  var width = 800;
  var height = 520;
  var margin = { top: 0, left: 20, bottom: 40, right: 20 };

  var separation = 10;
  var yStep = 100;

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // Sizing for the grid visualization
  var squareSize = 6;
  var squarePad = 2;
  var numPerRow = width / (squareSize + squarePad);

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  // initialize scales
  var xScale = d3.scaleLinear()
    .range([margin.left, width - margin.right]);

  var yScale = d3.scaleLinear()
    .range([height, 0]);

  var xAxisScatter = d3.axisBottom();
  var yAxisScatter = d3.axisLeft();
 

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function(selection) {
    selection.each(function(data) {

      svg = d3.select(this).selectAll('svg').data([data]);
      var svgE = svg.enter().append('svg');
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE);

      svg.attr('width', width + margin.left + margin.right);
      svg.attr('height', height + margin.top + margin.bottom);

      svg.append('g');

      // this group element will be used to contain all
      // other elements.
      g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // perform some preprocessing on raw data
      // var wordData = getWords(rawData);

      setupVis(data);

      setupSections();
    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param data - data object
   */
  var setupVis = function(data) {

    // count host title
    g.append('text')
      .attr('class', 'title summary-title')
      .attr('x', width / 2 + 3.5 * separation)
      .attr('y', height / 3)
      .text(addThousandPoints(data.length));

    g.append('text')
      .attr('class', 'sub-title summary-title')
      .attr('x', width / 2 + 4.5 * separation)
      .attr('y', height / 3)
      .text('Hosts');

    g.append('text')
      .attr('class', 'title summary-title')
      .attr('x', width - 6 * separation)
      .attr('y', height / 3 + yStep)
      .text(calculateEarnings(data));

    g.append('text')
      .attr('class', 'sub-title summary-title')
      .attr('x', width - 6 * separation)
      .attr('y', height / 3 + yStep)
      .text('€'); // calculateRooms

    g.append('text')
      .attr('class', 'title summary-title')
      .attr('x', width / 2 + 10 * separation)
      .attr('y', height / 3 + yStep * 2)
      .text(calculateRooms(data));

    g.append('text')
      .attr('class', 'sub-title summary-title')
      .attr('x', width / 2 + 11 * separation)
      .attr('y', height / 3 + yStep * 2)
      .text('Rooms');

    g.selectAll('.summary-title')
      .attr('opacity', 0);
    //! count host title

    // scaterPlot
    // x axis shows earnings

    xScale.domain([0, d3.max(data, function(d){
      return d.earnings;})
    ]);

    yScale.domain([0, d3.max(data, function(d){
      return d.id;})
    ])

    xAxisScatter.scale(xScale);
    yAxisScatter.scale(yScale);

    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxisScatter);
    g.select('.x.axis').style('opacity', 0);

    g.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + margin.left + ',0)')
      //.attr('transform', 'translate(0,0)')
      .call(yAxisScatter);
    g.select('.x.axis').style('opacity', 0);




    //! scatterPlot

  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  var setupSections = function() {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showSummary;
    activateFunctions[1] = showScatterPlot;
    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for (var i = 0; i < 3; i++) {
      updateFunctions[i] = function() {};
    }
    // updateFunctions[I] = X
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showSummary - initial summary
   *
   * hides: TODO scatterplot
   * (no previous step to hide)
   * shows: summary title
   *
   */
  function showSummary() {

    g.selectAll('.axis')
      .transition()
      .duration(100)
      .style('opacity', 0);

    g.selectAll('.summary-title')
      .transition()
      .duration(600)
      .attr('opacity', 1.0);
  }

  /**
   * showScatterPlot - Rooms vs. Earnings
   *
   * hides: summary title
   * hides: TODO next step
   * shows: scatter plot
   *
   */
  function showScatterPlot() {

    g.selectAll('.summary-title')
      .transition()
      .duration(100)
      .attr('opacity', 0);

    // ensure axis are set
    showXAxis(xAxisScatter);
    showYAxis(yAxisScatter);

    
  }

  /**
   * showAxis - helper function to
   * display particular xAxis
   *
   * @param axis - the axis to show
   */
  function showXAxis(axis) {
    g.select('.x.axis')
      .call(axis)
      .transition().duration(500)
      .style('opacity', 1);
  }

  function showYAxis(axis) {
    g.select('.y.axis')
      .call(axis)
      .transition().duration(500)
      .style('opacity', 1);
  }

  /**
   * UPDATE FUNCTIONS
   *
   * These will be called within a section
   * as the user scrolls through it.
   *
   * We use an immediate transition to
   * update visual elements based on
   * how far the user has scrolled
   *
   */

  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */
  function addThousandPoints(s) {

    return s.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  function calculateEarnings(data) {
    total = 0;
    for (i = 0; i < data.length; i++) {
      total += data[i].earnings;
    };

    return addThousandPoints(total);
  };

  function calculateRooms(data) {
    total = 0;
    for (i = 0; i < data.length; i++) {
      total += data[i].id;
    };

    return addThousandPoints(total);
  };


  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function (index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function(index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded csv data
 */
function display(data) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select('#vis')
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function (index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function (index, progress) {
    plot.update(index, progress);
  });
}

// load data, clean and and display
d3.csv('data/output/count-id.csv', function(d) {
    d.earnings = +d.earnings;
    d.id = +d.id;
    return d
  }).then(display);