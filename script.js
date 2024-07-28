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

    const hotelsByCity = d3.rollups(data, v => v.length, d => d.city).sort((a, b) => b[1] - a[1]);
    y.domain(hotelsByCity.map(d => d[0]));
    x.domain([0, d3.max(hotelsByCity, d => d[1])]);

    svg.append('g')
        .call(d3.axisLeft(y));
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

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

    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "20px") 
        .text("Number of Hotels by City");

    svg.selectAll(".bar")
        .data(hotelsByCity)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d[0]))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(d[1]))
        .attr("fill", "#4CAF50");
}

function createScatterPlot(data) {
    const scene = d3.select("#scatterPlot");
    scene.html(''); // Clear previous SVG elements
    scene.style('display', 'block');
    d3.select("#barChart").style('display', 'none');

    const margin = {top: 40, right: 20, bottom: 70, left: 70},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const svg = scene.append('svg')
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





document.getElementById("nextButton").addEventListener("click", function() {
    currentScene = (currentScene + 1) % 2; 
    updateScene();
});
