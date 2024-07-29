let currentScene = 0;
let data;
let minHotels = 0;

d3.csv("goibibo_com-travel_sample.csv").then(loadedData => {
    data = loadedData;
    updateScene();
}).catch(error => {
    console.error("Error loading the data:", error);
});

function updateScene() {
    const scenes = [
        () => createBarChart(data, minHotels),
        () => createScatterPlot(data),
        () => createHistogram(data)
    ];
    d3.selectAll('.scene').style('display', 'none');
    scenes[currentScene]();
}

function createBarChart(data, minHotels) {
    const scene = d3.select("#barChart");
    scene.html('');
    scene.style('display', 'block');
    d3.select("#scatterPlot").style('display', 'none');
    d3.select("#histogram").style('display', 'none');

    const margin = {top: 40, right: 20, bottom: 100, left: 100},
          width = 960 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    const svg = scene.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const y = d3.scaleBand().range([height, 0]).padding(0.1),
          x = d3.scaleLinear().range([0, width]);

    const filteredData = d3.rollups(data, v => v.length, d => d.city)
        .filter(d => d[1] >= minHotels)
        .sort((a, b) => b[1] - a[1]);

    y.domain(filteredData.map(d => d[0]));
    x.domain([0, d3.max(filteredData, d => d[1])]);

    svg.append('g')
        .call(d3.axisLeft(y));
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    const bars = svg.selectAll(".bar")
        .data(filteredData)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d[0]))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(d[1]))
        .attr("fill", "#4CAF50");

    bars.append("title")
        .text(d => `City: ${d[0]} \nHotels: ${d[1]}`);

    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "20px") 
        .text("Number of Hotels by City");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 20})`)
        .text("Number of Hotels");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 40)
        .attr("x", -(height / 2))
        .text("City");
}

function createScatterPlot(data) {
    const s = d3.select("#scatterPlot");
    s.html('');
    s.style('display', 'block');
    d3.select("#barChart").style('display', 'none');
    d3.select("#histogram").style('display', 'none');

    const margin = {top: 40, right: 20, bottom: 70, left: 70},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const svg = s.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().range([0, width]),
          y = d3.scaleLinear().range([height, 0]);

    const validData = data.filter(d => !isNaN(+d.price) && !isNaN(+d.rating));
    x.domain([0, d3.max(validData, d => +d.price)]);
    y.domain([0, d3.max(validData, d => +d.rating)]);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));
    svg.append('g')
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 20})`)
        .text("Price");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -(height / 2))
        .text("Rating");

    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "20px") 
        .text("Hotel Price vs Rating Scatter Plot");

    svg.selectAll(".dot")
        .data(validData)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(+d.price))
        .attr("cy", d => y(+d.rating))
        .attr("r", 5)
        .attr("fill", "#ff6347");
}

function createHistogram(data) {
    const scene = d3.select("#histogram");
    scene.html('');
    scene.style('display', 'block');
    d3.select("#barChart").style('display', 'none');
    d3.select("#scatterPlot").style('display', 'none');

    const margin = {top: 40, right: 20, bottom: 70, left: 70},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const svg = scene.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, 5])
        .range([0, width]);

    const bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(20))
        (data.map(d => d.rating));

    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height, 0]);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .call(d3.axisLeft(y));

    const bar = svg.selectAll(".bar")
        .data(bins)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", d => `translate(${x(d.x0)},${y(d.length)})`);

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
        .attr("height", d => height - y(d.length))
        .attr("fill", "#6a5acd");

    bar.append("text")
        .text(d => d.length)
        .attr("dy", "1.5em")
        .attr("dx", "0.5em")
        .attr("font-size", "12px")
        .attr("fill", "white");

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("Distribution of Hotel Ratings");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 20})`)
        .text("Rating");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -(height / 2))
        .text("Number of Hotels");
}

document.getElementById("nextButton").addEventListener("click", function() {
    currentScene = (currentScene + 1) % 3;
    updateScene();
});