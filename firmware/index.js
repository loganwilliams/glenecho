var WIFI_NAME = "";
var WIFI_OPTIONS = { password : "" };

var wifi = require("Wifi");

var i2c = new I2C();
i2c.setup({sda:A6,scl:A7});
var bme = require("BME680").connectI2C(i2c);
var ow = new OneWire(B0);
var sensor = require("DS18B20").connect(ow);
var http = require('http');

wifi.connect(WIFI_NAME, WIFI_OPTIONS, function(err) {
  if (err) {
    console.log("Connection error: "+err);
    return;
  }
  console.log("Connected!");
  
  startLogging();
});

function startLogging() {
  setInterval(function() {
    logBME680();
    logDS18B20();
    logTSD10();
    logAudio();
  }, 5000);
}

function logBME680() {
  var data = bme.get_sensor_data();

  var temp = {"sensor": "bme680", 
              "site": 0,
              "measurement": "temperature", 
              "value": data.temperature};

  sendData(temp);

  var humidity = {"sensor": "bme680",
                  "site": 0,
                  "measurement": "humidity", 
                  "value": data.humidity};

  sendData(humidity);

  var gas = {"sensor": "bme680",
             "site": 0,
             "measurement": "gas_resistance", 
             "value": data.gas_resistance};

  sendData(gas);

  var pressure = {"sensor": "bme680",
                  "site": 0,
                  "measurement": "pressure", 
                  "value": data.pressure};

  sendData(pressure);

  bme.perform_measurement();
}

function logDS18B20() {
  sensor.getTemp(function (temp) {
    var sdata = {'sensor': 'ds18b20',
                 'site': 0,
                 'measurement': 'temperature',
                 'value': temp};
    
    sendData(sdata);
  });
}

function logTSD10() {
  var turbidity = 0;
  var n_turbidity = 0;
  
  var interval = setInterval(function() {
    turbidity += analogRead(A1);
    n_turbidity += 1;
  }, 25);
  
  setTimeout(function() {
    clearInterval(interval);
    var f_turbidity = turbidity / n_turbidity;
    var sdata = {'sensor': 'tsd10',
                 'site': 0,
                 'measurement': 'turbidity',
                 'value': f_turbidity};
    
    sendData(sdata);
  }, 990);     
}

function logAudio() {
  var audio = 0;
  var n_audio = 0;
  
  var audio_sampler = setInterval(function() {
    var raw = analogRead(A0);
    var v = Math.abs(raw - 0.5);
    audio += v;
    n_audio += 1;    
  }, 5);
    
  setTimeout(function() {
    clearInterval(audio_sampler);
    var avg_audio = audio / n_audio;
    var sdata = {'sensor': 'max4466',
                 'site': 0,
                 'measurement': 'max_volume',
                 'value': avg_audio};
    
    sendData(sdata);
  }, 990);
}


function sendData(sdata) {
  var payload = JSON.stringify(sdata);
  var options = {
    host: '192.168.1.94',
    port: '8080',
    method: 'POST',
    path: '/log',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic YWRtaW46Z29k',
      'Content-Length': payload.length
    }
  };
    
  var req = http.request(options, function(res) {
    req.end();
  });
  
  req.on('error', function(e) {
    console.log('Problem with request: ' + e.message);
  });
         
  req.write(payload);  
}
