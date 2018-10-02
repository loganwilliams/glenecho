function start(){
  
var WIFI_NAME = "CnC(N) Idea Factory";
var WIFI_OPTIONS = { password : "happyhome" };

var wifi = require("Wifi");

var i2c = new I2C();
i2c.setup({sda:A6,scl:A7});
var bme = require("BME680").connectI2C(i2c);

//var ow = new OneWire(B0);
//var sensor = require("DS18B20").connect(ow);

var http = require('http');

wifi.connect(WIFI_NAME, WIFI_OPTIONS, function(err) {
  if (err) {
    console.log("Connection error: "+err);
    return;
  }
  console.log("Connected!");
  
  startLogging();
});
  
var count = 0;

function startLogging() {  
  setInterval(function() {
    log();
    count++;
    
    if (count > 60*6) {
      E.reboot();
    }
  }, 60000);
  
  //setDeepSleep(1);
}

function log() {
  logBME680();
  //setTimeout(logDS18B20, 1000);
  //setTimeout(logTSD10, 2000);
  setTimeout(logAudio, 3000);
  setTimeout(logDepth, 4000);
  //setDeepSleep(1);
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
  
  for (var i = 0; i < 100; i++) {
    turbidity += analogRead(B1)*0.01;
  }
  
  var sdata = {'sensor': 'tsd10',
               'site': 0,
               'measurement': 'turbidity',
               'value': turbidity};
    
  sendData(sdata);
}

function logAudio() {
  var audio = 0;
  var n_audio = 0;
  
  var audio_sampler = setInterval(function() {
    var raw = analogRead(A0);
    var v = Math.pow(raw - 0.5, 2);
    audio += v;
    n_audio += 1;    
  }, 1);
    
  setTimeout(function() {
    clearInterval(audio_sampler);
    var avg_audio = Math.sqrt(audio / n_audio);
    var sdata = {'sensor': 'max4466',
                 'site': 0,
                 'measurement': 'max_volume',
                 'value': avg_audio};
    
    sendData(sdata);
  }, 5000);
}
  
function logDepth() {
  var v = 0;
  for (var i = 0; i < 100; i++) {
    v += analogRead(A1) * 0.01;
  }
  
  var r = 560 * v / (1 - v);
  var depth = 15.35 - 0.006345 * r;
  var sdata = {'sensor': 'etape12',
               'site': 0,
               'measurement': 'depth',
               'value': depth};
  
  sendData(sdata);
}
  
function sendData(sdata) {
  var payload = JSON.stringify(sdata);
  var options = {
    host: 'glenecho.stream',
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

}
E.on("init", start);
save();