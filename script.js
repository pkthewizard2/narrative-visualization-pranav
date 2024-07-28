let currentScene = 0;
let data;

d3.csv("goibibo_com-travel_sample.csv").then(loadedData => {
    data = loadedData; 
    updateScene(); 
});

function updateScene() {
    switch(currentScene) {
        case 0:
            createBarChart(data);
            break;
        case 1:
            createScatterPlot(data);
            break;
    }
}

function createBarChart(data) {
    const scene = d3.select("#barChart");
    scene.html(''); 
    scene.style('display', 'block');
    d3.select("#scatterPlot").style('display', 'none');

    const margin = {top: 20, right: 20, bottom: 30, left: 40},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const svg = scene.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().range([0, width]).padding(0.1),
          y = d3.scaleLinear().range([height, 0]);

    const hotelsByCity = d3.rollups(data, v => v.length, d => d.city);
    x.domain(hotelsByCity.map(d => d[0]));
    y.domain([0, d3.max(hotelsByCity, d => d[1])]);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));
    svg.append('g')
        .call(d3.axisLeft(y));

    svg.selectAll(".bar")
        .data(hotelsByCity)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d[0]))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d[1]))
        .attr("height", d => height - y(d[1]))
        .attr("fill", "steelblue")
      .append("title")  
        .text(d => `City: ${d[0]}, Hotels: ${d[1]}`);
}

function createScatterPlot(data) {
    const scene = d3.select("#scatterPlot");
    scene.html('');
    scene.style('display', 'block');
    d3.select("#barChart").style('display', 'none');

    const margin = {top: 20, right: 20, bottom: 30, left: 40},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const svg = scene.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().range([0, width]),
          y = d3.scaleLinear().range([height, 0]);

    x.domain([0, d3.max(data, d => +d.price)]);
    y.domain([0, d3.max(data, d => +d.rating)]);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));
    svg.append('g')
        .call(d3.axisLeft(y));

    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(+d.price))
        .attr("cy", d => y(+d.rating))
        .attr("r", 5)
        .attr("fill", "red")
      .append("title")  
        .text(d => `${d.hotel_name}: Price ${d.price}, Rating ${d.rating}`);
}

document.getElementById("nextButton").addEventListener("click", function() {
    currentScene = (currentScene + 1) % 2; 
    updateScene();
});
