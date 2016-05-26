/*
 * Flush stats to kafka (http://kafka.apache.org/).
 *
 * Currently, only publishing metrics via the kafka rest proxy is supported.
 * A nice enhancement would be to allow publishing via the kafka binary protocol as well.
 *
 * To enable this backend, include 'kafka-backend' in the backends
 * configuration array:
 *
 *   backends: ['kafka-backend']
 *
 * This backend supports the following config options:
 *
 *   restProxyUrl: comma-separate list of broker nodes
 *
 * example output:
 * {
 *   "gauges": {
 *     "stats_counts.statsd.bad_lines_seen": 0,
 *     "stats_counts.statsd.packets_received": 63,
 *     "stats_counts.statsd.metrics_received": 63,
 *     "stats.gauges.not-configured-app.v0.api.response-code.500.m1_rate": 0,
 *     "stats.gauges.not-configured-app.v0.api.response-code.500.m5_rate": 0,
 *     "stats.gauges.not-configured-app.v0.api.response-code.500.m15_rate": 0,
 *     "stats.gauges.not-configured-app.v0.api.response-code.500.mean_rate": 0,
 *     "stats.gauges.statsd.timestamp_lag": 0,
 *     "statsd.numStats": 0,
 *     "stats.statsd.kafkaStats.calculationtime": 0,
 *     "stats.statsd.processing_time": 0,
 *     "stats.statsd.kafkaStats.last_exception": 1462375567,
 *     "stats.statsd.kafkaStats.last_flush": 1462375587,
 *     "stats.statsd.kafkaStats.flush_time": 59,
 *     "stats.statsd.kafkaStats.flush_length": 4793
 *   },
 *   "durationUnit": "milliseconds",
 *   "clock": 1462375597,
 *   "rateUnit": "seconds"
 * }
 *
 */

 var net   = require('net'),
     util  = require('util'),
     http  = require('http'),
     https = require('https'),
     url   = require('url');

var debug;
var flushInterval;
var restProxyUrl;

// prefix configuration
var globalPrefix;
var prefixPersecond;
var prefixCounter;
var prefixTimer;
var prefixGauge;
var prefixSet;
var prefixStats;

// set up namespaces
var legacyNamespace  = true;
var globalNamespace  = [];
var counterNamespace = [];
var timerNamespace   = [];
var gaugesNamespace  = [];
var setsNamespace    = [];

var kafkaStats = {};

function metric(val) {
  return val;
}

var post_stats = function kafka_publish_stats(metricsObject) {
  var last_flush = kafkaStats.last_flush || 0;
  var last_exception = kafkaStats.last_exception || 0;
  var flush_time = kafkaStats.flush_time || 0;
  var flush_length = kafkaStats.flush_length || 0;

  if (restProxyUrl) {
    try {
      var starttime = Date.now();
      var ts = Math.round(new Date().getTime() / 1000);
      var namespace = globalNamespace.concat(prefixStats).join(".");

      metricsObject.gauges[namespace + '.kafkaStats.last_exception'] = metric(last_exception);
      metricsObject.gauges[namespace + '.kafkaStats.last_flush'] = metric(last_flush);
      metricsObject.gauges[namespace + '.kafkaStats.flush_time'] = metric(flush_time);
      metricsObject.gauges[namespace + '.kafkaStats.flush_length'] = metric(flush_length);

      var kafkaMetricsObject = {
          'records':[
            {
              'value': metricsObject
            }
          ]
        };
      var data = JSON.stringify(kafkaMetricsObject);

      var options = url.parse(restProxyUrl.concat("/").concat(kafkaTopic));
      options.method = 'POST';
      options.headers = {
        'Content-Length': data.length,
        'Content-Type': 'application/vnd.kafka.json.v1+json',
        'Accept': 'application/json'
      };

      var req;

      if(options.protocol === 'https:'){
        req = https.request(options, function(res) {
          res.setEncoding('utf8');
        });
      } else {
        req = http.request(options, function(res) {
          res.setEncoding('utf8');
          res.on('data', function(payload) {
            for (offset in payload.offsets) {
              if (offset.error) {
                console.log('Error: ' + offset.error + ' Code: ' + offset.error_code);
              }
            }
          });
        });
      }

      req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
        kafkaStats.last_exception = Math.round(new Date().getTime() / 1000);
      });

      req.on('close', function(e) {
        kafkaStats.flush_time = (Date.now() - starttime);
        kafkaStats.flush_length = data.length;
        kafkaStats.last_flush = Math.round(new Date().getTime() / 1000);
      });

      req.write(data);
      req.end();

    } catch(e) {
      if (debug) {
        util.log(e);
      }
      kafkaStats.last_exception = Math.round(new Date().getTime() / 1000);
    }
  }
};

var flush_stats = function kafka_flush(ts, metrics) {
  var starttime = Date.now();
  var metricsObject = {
    'gauges':{},
    'durationUnit': 'milliseconds',
    'clock': ts,
    'rateUnit': 'seconds'
  };

  var numStats = 0;
  var key;
  var timer_data_key;
  var counters = metrics.counters;
  var gauges = metrics.gauges;
  var timers = metrics.timers;
  var sets = metrics.sets;
  var counter_rates = metrics.counter_rates;
  var timer_data = metrics.timer_data;
  var statsd_metrics = metrics.statsd_metrics;

  for (key in counters) {
    var namespace = counterNamespace.concat(key);
    var value = counters[key];

    if (legacyNamespace === true) {
      metricsObject.gauges['stats_counts.' + key] = metric(value);
    } else {
      metricsObject.gauges[namespace.concat('count').join('.')] = metric(value);
    }
  }

  for (key in timer_data) {
    var namespace = timerNamespace.concat(key);
    var the_key = namespace.join(".");
    for (timer_data_key in timer_data[key]) {
      if (typeof(timer_data[key][timer_data_key]) === 'number') {
        metricsObject.gauges[the_key + '.' + timer_data_key] = metric(timer_data[key][timer_data_key]);
      } else {
        for (var timer_data_sub_key in timer_data[key][timer_data_key]) {
          var mpath = the_key + '.' + timer_data_key + '.' + timer_data_sub_key;
          var mval = timer_data[key][timer_data_key][timer_data_sub_key];
          if (debug) {
            util.log(mval.toString());
          }
          metricsObject.gauges[mpath] = metric(mval);
        }
      }
    }
  }

  for (key in gauges) {
    var namespace = gaugesNamespace.concat(key);
    metricsObject.gauges[namespace.join(".")] = metric(gauges[key]);
  }

  for (key in sets) {
    var namespace = setsNamespace.concat(key);
    metricsObject.gauges[namespace.join(".") + '.count'] = metric(sets[key].values().length);
  }

  //these go into gauges object
  var namespace = globalNamespace.concat(prefixStats);
  if (legacyNamespace === true) {
    metricsObject.gauges[prefixStats + '.numStats'] = metric(numStats);
    metricsObject.gauges['stats.' + prefixStats + '.kafkaStats.calculationtime'] = metric(Date.now() - starttime);
    for (key in statsd_metrics) {
      metricsObject.gauges['stats.' + prefixStats + '.' + key] = metric(statsd_metrics[key]);
    }
  } else {
    metricsObject.gauges[namespace.join(".") + '.numStats'] = metric(numStats);
    metricsObject.gauges[namespace.join(".") + '.kafkaStats.calculationtime'] = metric(Date.now() - starttime);
    for (key in statsd_metrics) {
      var the_key = namespace.concat(key);
      metricsObject.gauges[the_key.join(".")] = metric(statsd_metrics[key]);
    }
  }

  post_stats(metricsObject);
};

var backend_status = function kafka_status(writeCb) {
  for (var stat in kafkaStats) {
    writeCb(null, 'kafka', stat, kafkaStats[stat]);
  }
};

exports.init = function kafka_init(startup_time, config, events) {
  debug           = config.debug;
  prefixStats     = config.prefixStats;
  restProxyUrl    = config.restProxyUrl;
  kafkaTopic      = config.kafkaTopic;
  config.kafka    = config.kafka || {};
  globalPrefix    = config.kafka.globalPrefix;
  prefixCounter   = config.kafka.prefixCounter;
  prefixTimer     = config.kafka.prefixTimer;
  prefixGauge     = config.kafka.prefixGauge;
  prefixSet       = config.kafka.prefixSet;
  legacyNamespace = config.kafka.legacyNamespace;

  // set defaults for prefixes
  globalPrefix  = globalPrefix !== undefined ? globalPrefix : "stats";
  prefixCounter = prefixCounter !== undefined ? prefixCounter : "counters";
  prefixTimer   = prefixTimer !== undefined ? prefixTimer : "timers";
  prefixGauge   = prefixGauge !== undefined ? prefixGauge : "gauges";
  prefixSet     = prefixSet !== undefined ? prefixSet : "sets";
  prefixStats   = prefixStats !== undefined ? prefixStats : "statsd";
  legacyNamespace = legacyNamespace !== undefined ? legacyNamespace : true;

  if (legacyNamespace === false) {
    if (globalPrefix !== "") {
      globalNamespace.push(globalPrefix);
      counterNamespace.push(globalPrefix);
      timerNamespace.push(globalPrefix);
      gaugesNamespace.push(globalPrefix);
      setsNamespace.push(globalPrefix);
    }

    if (prefixCounter !== "") {
      counterNamespace.push(prefixCounter);
    }
    if (prefixTimer !== "") {
      timerNamespace.push(prefixTimer);
    }
    if (prefixGauge !== "") {
      gaugesNamespace.push(prefixGauge);
    }
    if (prefixSet !== "") {
      setsNamespace.push(prefixSet);
    }
  } else {
      globalNamespace = ['stats'];
      counterNamespace = ['stats'];
      timerNamespace = ['stats', 'timers'];
      gaugesNamespace = ['stats', 'gauges'];
      setsNamespace = ['stats', 'sets'];
  }

  kafkaStats.last_flush = startup_time;
  kafkaStats.last_exception = startup_time;
  kafkaStats.flush_time = 0;
  kafkaStats.flush_length = 0;

  flushInterval = config.flushInterval;

  events.on('flush', flush_stats);
  events.on('status', backend_status);

  return true;
};
