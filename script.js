width = 1280;
height = 720;

async function main() {
  const geoData = await getGeoData();
  const educationData = await getEducationData();
  const svg = createSvg();

  const colors = ['#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7'];
  const [min, max] = d3.extent(educationData, d => d.bachelorsOrHigher);

  const tooltip = createTooltip();
  createLegend(svg, colors);

  svg
    .selectAll('path')
    .data(topojson.feature(geoData, geoData.objects.counties).features)
    .enter()
    .append('path')
    .attr('d', d3.geoPath())
    .attr('class', 'county')
    .attr('data-fips', d => d.id)
    .attr('data-education', d => {
      const data = findData(educationData, d);
      return data.bachelorsOrHigher;
    })
    .attr('fill', d => {
      const data = findData(educationData, d);
      const idx = Math.floor((data.bachelorsOrHigher / max) * colors.length);
      return colors[idx];
    })
    .on('mouseenter', (evt, d) => {
      const data = findData(educationData, d);
      const { x, y } = evt;
      const offset = 7;

      tooltip.style('top', `${y - offset}px`);
      tooltip.style('left', `${x + offset}px`);
      tooltip.attr('data-education', data.bachelorsOrHigher);
      tooltip.style('opacity', 1);
      tooltip.text(`${data.area_name}, ${data.state}: ${data.bachelorsOrHigher}`);
    })
    .on('mouseleave', () => tooltip.style('opacity', 0));
}

async function getEducationData() {
  const url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
  const resp = await fetch(url);
  return await resp.json();
}

async function getGeoData() {
  const url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
  const resp = await fetch(url);
  return await resp.json();
}

function createSvg() {
  return d3.select('body').append('svg').attr('height', height).attr('width', width);
}

function createTooltip() {
  return d3
    .select('body')
    .append('div')
    .attr('id', 'tooltip')
    .style('opacity', 0)
    .style('position', 'fixed')
    .style('z-index', 10);
}

function createLegend(svg, colors) {
  const legendStartX = 25;
  const legendStartY = 625;
  const legendItemSpacing = 20;

  const legend = svg.append('g').attr('id', 'legend');

  legend
    .selectAll('rect')
    .data(colors)
    .enter()
    .append('rect')
    .attr('x', legendStartX)
    .attr('y', (_, i) => legendStartY + i * legendItemSpacing)
    .attr('width', 7)
    .attr('height', 7)
    .attr('fill', d => d);

  legend
    .selectAll('text')
    .data(['very low', 'low', 'normal', 'high'])
    .enter()
    .append('text')
    .attr('x', legendStartX + 15)
    .attr('y', (_, i) => legendStartY + 7 + i * legendItemSpacing)
    .attr('fill', 'black')
    .text(d => d);
}

function findData(educationData, d) {
  return educationData.find(ed => ed.fips === d.id);
}

main();
