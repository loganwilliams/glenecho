import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import moment from 'moment';

class DisplayTime extends Component {
  render() {
    let d = new moment(this.props.time);
    console.log(d);
    return <div className="time">{
      "Report " + d.format("HHmm") + " seq " + d.format("DDD/365") + " vol " + d.format("YYYY")}
    </div>
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

    filteredData = filteredData.map(f => {
      f.value = +f.value.toFixed(2);
      return f;
    });

    let latest = filteredData[0] ? filteredData[0].value : "0";

    if (units != "%") {
      units = " " + units;
    }

    if (units === " F") {
      units = "°F"
    }

    return <div className="number">
      <div className="title">{this.props.text}</div>
      <div className="value">{latest + units}</div>
    </div>
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    fetch('http://glenecho.stream:8080/list').then(r => r.json()).then(data => {
      console.log(data);
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
                units="in"/>
              <Display
                data={this.state.data || []}
                measurement="temperature"
                sensor="ds18b20"
                text="Stream temperature"
                units="C" />
              <Display
                data={this.state.data || []}
                measurement="humidity"
                text="Atmospheric humidity"
                units="%" />
              <Display
                data={this.state.data || []}
                measurement="temperature"
                sensor="bme680"
                text="Atmospheric temperature"
                units="C"/>
              <Display
                data={this.state.data || []}
                measurement="pressure"
                text="Atmospheric pressure"
                units="mbar" />
              <Display
                data={this.state.data || []}
                measurement="max_volume"
                text="Ambient volume"
                units="%%"
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
