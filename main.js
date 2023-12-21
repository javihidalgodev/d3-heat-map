import './style.css'
import * as d3 from 'd3'

// 1. Declaración de variables para datos y medidas del SVG
const dataURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'

let colorbrewer = {
  RdYlBu: {
    3: ['#fc8d59', '#ffffbf', '#91bfdb'],
    4: ['#d7191c', '#fdae61', '#abd9e9', '#2c7bb6'],
    5: ['#d7191c', '#fdae61', '#ffffbf', '#abd9e9', '#2c7bb6'],
    6: ['#d73027', '#fc8d59', '#fee090', '#e0f3f8', '#91bfdb', '#4575b4'],
    7: [
      '#d73027',
      '#fc8d59',
      '#fee090',
      '#ffffbf',
      '#e0f3f8',
      '#91bfdb',
      '#4575b4'
    ],
    8: [
      '#d73027',
      '#f46d43',
      '#fdae61',
      '#fee090',
      '#e0f3f8',
      '#abd9e9',
      '#74add1',
      '#4575b4'
    ],
    9: [
      '#d73027',
      '#f46d43',
      '#fdae61',
      '#fee090',
      '#ffffbf',
      '#e0f3f8',
      '#abd9e9',
      '#74add1',
      '#4575b4'
    ],
    10: [
      '#a50026',
      '#d73027',
      '#f46d43',
      '#fdae61',
      '#fee090',
      '#e0f3f8',
      '#abd9e9',
      '#74add1',
      '#4575b4',
      '#313695'
    ],
    11: [
      '#a50026',
      '#d73027',
      '#f46d43',
      '#fdae61',
      '#fee090',
      '#ffffbf',
      '#e0f3f8',
      '#abd9e9',
      '#74add1',
      '#4575b4',
      '#313695'
    ]
  },
  RdBu: {
    3: ['#ef8a62', '#f7f7f7', '#67a9cf'],
    4: ['#ca0020', '#f4a582', '#92c5de', '#0571b0'],
    5: ['#ca0020', '#f4a582', '#f7f7f7', '#92c5de', '#0571b0'],
    6: ['#b2182b', '#ef8a62', '#fddbc7', '#d1e5f0', '#67a9cf', '#2166ac'],
    7: [
      '#b2182b',
      '#ef8a62',
      '#fddbc7',
      '#f7f7f7',
      '#d1e5f0',
      '#67a9cf',
      '#2166ac'
    ],
    8: [
      '#b2182b',
      '#d6604d',
      '#f4a582',
      '#fddbc7',
      '#d1e5f0',
      '#92c5de',
      '#4393c3',
      '#2166ac'
    ],
    9: [
      '#b2182b',
      '#d6604d',
      '#f4a582',
      '#fddbc7',
      '#f7f7f7',
      '#d1e5f0',
      '#92c5de',
      '#4393c3',
      '#2166ac'
    ],
    10: [
      '#67001f',
      '#b2182b',
      '#d6604d',
      '#f4a582',
      '#fddbc7',
      '#d1e5f0',
      '#92c5de',
      '#4393c3',
      '#2166ac',
      '#053061'
    ],
    11: [
      '#67001f',
      '#b2182b',
      '#d6604d',
      '#f4a582',
      '#fddbc7',
      '#f7f7f7',
      '#d1e5f0',
      '#92c5de',
      '#4393c3',
      '#2166ac',
      '#053061'
    ]
  }
};


// 2. Petición de los datos
d3.json(dataURL).then(data => {
  
  const dataset = data.monthlyVariance
  const {baseTemperature} = data
  let w = 5 * Math.ceil(dataset.length / 12)
  let h = 33 * 12
  const p = 60
  let legendColors = colorbrewer.RdYlBu[11].reverse()
  let legendWidth = 400
  let legendHeight = 300 / legendColors.length

  const tooltip = d3.select('#app')
  .append('div')
  .attr('id', 'tooltip')

  // console.log(dataset, baseTemperature)
  data.monthlyVariance.forEach(function (val) {
    val.month -= 1;
  });

  let variance = dataset.map(function (val) {
    return val.variance;
  });

  let minTemp = baseTemperature + Math.min.apply(null, variance);
  let maxTemp = baseTemperature + Math.max.apply(null, variance);

  let legendThreshold = d3
  .scaleThreshold()
  .domain(
    (function (min, max, count) {
      var array = [];
      var step = (max - min) / count;
      var base = min;
      for (var i = 1; i < count; i++) {
        array.push(base + i * step);
      }
      return array;
    })(minTemp, maxTemp, legendColors.length)
  )
  .range(legendColors);

  const legendX = d3.scaleLinear()
  .domain([minTemp, maxTemp])
  .range([p, w-p])

  const legendXAxis = d3.axisBottom()
  .scale(legendX)
  .tickSize(10, 0)
  .tickValues(legendThreshold.domain())
  .tickFormat(d3.format('.1f'))

  // 3. Escalas
  let xScale = d3
    .scaleBand()
    .domain(
      dataset.map(function (val) {
        return val.year;
      })
    )
    .range([p, w - p])
    .padding(0);

  let xAxis = d3
    .axisBottom()
    .scale(xScale)
    .tickValues(
      xScale.domain().filter(function (year) {
        // set ticks to years divisible by 10
        return year % 10 === 0;
      })
    )
    .tickFormat(function (year) {
      let date = new Date(0);
      date.setUTCFullYear(year);
      let format = d3.utcFormat('%Y');
      return format(date);
    })
    .tickSize(10, 1);

  const yScale = d3
    .scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .rangeRound([p, h - p])
    .padding(0);

    const yAxis = d3
      .axisLeft()
      .scale(yScale)
      .tickValues(yScale.domain())
      .tickFormat(function (month) {
        let date = new Date(0);
        date.setUTCMonth(month);
        let format = d3.utcFormat('%B');
        return format(date);
      })
      .tickSize(10, 1);

  d3.select('#app')
  .append('h1')
  .attr('id', 'title')
  .text('Monthly Global Land-Surface Temperature')
  d3.select('#app')
  .append('h2')
  .attr('id', 'subtitle')
  .text('1753 - 2015: base temperature 8.66℃')

  const svg = d3.select('#app')
  .append('svg')
  .attr('id', 'description')
  .attr('width', w)
  .attr('height', h + 100)

  const legend = svg.append('g')
  .attr('id', 'legend')
  .attr('transform', `translate(0, ${h})`)

  legend
    .append('g')
    .selectAll('rect')
    .data(
      legendThreshold.range().map(function (color) {
        var d = legendThreshold.invertExtent(color);
        if (d[0] === null) {
          d[0] = legendX.domain()[0];
        }
        if (d[1] === null) {
          d[1] = legendX.domain()[1];
        }
        return d;
      })
    )
    .enter()
    .append('rect')
    .style('fill', function (d) {
      return legendThreshold(d[0]);
    })
    .attr('x', d => legendX(d[0]))
    .attr('y', 0)
    .attr('width', d =>
      d[0] && d[1] ? legendX(d[1]) - legendX(d[0]) : legendX(null)
    )
    .attr('height', legendHeight);

  legend
    .append('g')
    .attr('transform', 'translate(' + 0 + ',' + legendHeight + ')')
    .call(legendXAxis);

  svg.append('g')
  .attr('id', 'x-axis')
  .style('transform', `translate(0, ${h - p}px)`)
  .call(xAxis)
  svg.append('g')
  .attr('id', 'y-axis')
  .style('transform', `translate(${p}px, 0)`)
  .call(yAxis)

  svg.selectAll('rect')
  .data(dataset)
  .enter()
  .append('rect')
  .attr('class', 'cell')
  .attr('data-month', d => d.month)
  .attr('data-year', d => d.year)
  .attr('data-temp', d => baseTemperature + d.variance)
  .attr('x', d => xScale(d.year))
  .attr('y', d => yScale(d.month))
  .attr('width', d => xScale.bandwidth(d.year))
  .attr('height', d => yScale.bandwidth(d.month))
  .attr('fill', function (d) {
    return legendThreshold(baseTemperature + d.variance);
  })
  .on('mouseover', function (e, d) {
    const dataYear = e.target.getAttribute('data-year')
    
    let date = new Date(0);
    date.setUTCMonth(d.month);
    let format = d3.utcFormat('%B');
    const dataMonth =  format(date);

    d3.select('#tooltip')
    .attr('data-year', dataYear)
    .style('visibility', 'visible')
    .html(`
      <p>${dataYear} - ${dataMonth}</p>
      <p>${baseTemperature - d.variance}</p>
      <p>${d.variance}</p>
    `)
  })
  .on('mouseout', function () {
    d3.select('#tooltip')
    .style('visibility', 'hidden')
  })
})