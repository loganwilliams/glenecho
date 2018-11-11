import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import moment from 'moment';
import * as d3 from 'd3';

class DisplayTime extends Component {
  render() {
    let d = new moment(this.props.time);
    console.log(d);
    return <div className="time">{
      "Report " + d.format("HHmm") + " Sequence " + d.format("DDD") + " Volume " + d.format("YYYY")}
    </div>
  }
}

class Graph extends Component {
  drawChart() {
    let height = this.props.height;
    let width = this.props.width;
    let data = this.props.data;

    let min = this.props.min || d3.min(data.map(x => x[1]));
    let max = this.props.max || d3.max(data.map(x => x[1]));
    min -= (max - min) / 10;
    max += (max - min) / 10;

    console.log(this.props.domain);
    let xscale = d3.scaleTime()
      .domain(this.props.domain)
      .range([0, width-43]);

    let yscale = d3.scaleLinear()
      .domain([min, max])
      .range([height - 5, 15]);

    let line = d3.line()
      .x(d => xscale(d[0]))
      .y(d => yscale(d[1]))
      .curve(d3.curveLinear);

    let svg = d3.select(this.node).append("g")
      .attr("transform", "translate(100,0)");

    svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

    svg.append("g")
      .attr("transform", "translate(" + (width-35) + ", 0)")
      .attr("class", "yaxis")
      .call(d3.axisRight(yscale).ticks(2)); // Create an axis component with d3.axisLeft

    if (this.props.xaxis) {
      svg.append("g")
        .attr("transform", "translate(0," + (height+8) + ")")
        .attr("cass", "xaxis")
        .call(d3.axisBottom(xscale));
    }
  }

    componentDidMount() {
    this.drawChart();
  }

  render() {
    return <svg width={this.props.width} height={this.props.height + (this.props.xaxis ? 25 : 0)} className="chart" ref={n => this.node = n}></svg>
  }
}


class Display extends Component {
  



  render() {
    let filteredData = this.props.data.filter(f => {
      if (this.props.sensor) {
        return (f.measurement === this.props.measurement && f.sensor === this.props.sensor);
      } else {
        return (f.measurement === this.props.measurement)
      }
    });

    console.log(this.props.data)
    let domain = [d3.min(this.props.data.map(x => new Date(x.timestamp))), d3.max(this.props.data.map(x => new Date(x.timestamp)))]

    let units = this.props.units;


    if (units === "C") {
      filteredData = filteredData.map(f => {
        f.value = +f.value*9/5 + 32;
        return f;
      });
      units = "F";
    }

    if (units === "%%") {
      filteredData = filteredData.map(f => {
        f.value = +f.value * 100;
        return f;
      });
      units = "%";
    }

    if (units === "voc") {
      filteredData = filteredData.map(f => {
        f.value = Math.round(+f.value / 100);
        return f;
      });
      units = "";
    }

    let displayData = filteredData.map(f => {
      f.value = +f.value.toFixed(2);
      return f;
    });

    let latest = displayData[0] ? displayData[0].value : "0";

    if (units != "%") {
      units = " " + units;
    }

    if (units === " F") {
      units = "°F"
    }


    let chartData = filteredData.map(f => {
      let n = [];
      n[0] = new Date(f.timestamp);
      n[1] = f.value;
      return n;})

    return <div className={"number" + (this.props.disabled ? " disabled" : "")}>
      <div className="blocker"></div>
      <div className="title">{this.props.text}</div>
      <div className="value"><span>{latest + units}</span></div>
      <Graph data={chartData} height={75} width={700} max={this.props.max} min={this.props.min} xaxis={this.props.xaxis} domain={domain}/>
      {/* <LineChart data={chartData} min={this.props.min || 0} max={this.props.max} colors={["#fff", "#fff", "#fff"]} points={false} height="200px"/> */}
    </div>
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    fetch('http://glenecho.stream:8080/list').then(r => r.json()).then(data => {
      console.log(data);
      data = data.filter(f => +f.value > 0);
      this.setState({data});
    })
  }

  render() {
    if (this.state.data) {
      return (
        <div className="App">
          <header className="App-header">
            <h1>☱☵☶</h1>
          </header>

          <main>
            <DisplayTime
              time={this.state.data[0]["timestamp"]}
            />
            <div className="latest">
              <Display
                data={this.state.data || []}
                measurement="depth"
                text="Stream depth"
                units="in"
                legend={true}
              />
              <Display
                data={this.state.data || []}
                measurement="turbidity"
                text="Stream turbidity"
                units="" 
                disabled={true} />
              <Display
                data={this.state.data || []}
                measurement="temperature"
                sensor="ds18b20"
                text="Stream temperature"
                units="C"
                />
              <Display
                data={this.state.data || []}
                measurement="temperature"
                sensor="bme680"
                text="Atmospheric temperature"
                units="C"
                />
              <Display
                data={this.state.data || []}
                measurement="humidity"
                text="Atmospheric humidity"
                units="%" />
              <Display
                data={this.state.data || []}
                measurement="gas_resistance"
                text="Atmospheric volatiles"
                units="voc" />
              <Display
                data={this.state.data || []}
                measurement="pressure"
                text="Atmospheric pressure"
                units="mbar"
                />
              <Display
                data={this.state.data || []}
                measurement="max_volume"
                text="Ambient volume"
                units="%%"
                xaxis={true}
              />
            </div>
          </main>
        </div>
      );
    } else {
      return <div></div>
    }
  }
}

export default App;
