var express = require('express');
var router = express.Router();

var http = require('http');

var querystring = require('querystring');
var request = require('request');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: 'Express'
  });
});

router.get('/solr/*', function(req, res) {
  proxy.web(req, res, {
    target: 'http://' + proxyOptions.host + ':' + proxyOptions.port
  });
});

// Couchbase lookup endpoint
router.use('/testsolr/:designdoc/:view/:key', function(req, res, next) {
  // http://localhost:8092/beer-sample/_design/dev_andrew/_view/andrew?key=%22alaskan_brewing-alaskan_summer_ale%22
  // console.log('req.params = ',req.params);
  var options = {
    hostname: 'localhost',
    port: 8092,
    path: '/beer-sample/_design/' + req.params.designdoc + '/_view/' + req.params.view + '?key="' + req.params.key + '"',
    method: 'GET'
  };

  var reqSolr = http.request(options, function(resSolr) {
    var lookupResult = '';

    resSolr.on('data', function(chunk) {
      // console.log('BODY: ' + chunk);
      lookupResult += chunk;
    });

    resSolr.on('end', function() {
      res.send(lookupResult);
    });
  });

  reqSolr.end();
  // next();
});

// Hive lookup endpoint
router.post('/hive', function(req, res) {
  // var data = {
  //   'user.name': 'hue',
  //   'statusdir': 'myoutput',
  //   'execute': 'SELECT swid, birth_dt, gender_cd FROM users WHERE swid = ' + value
  // }
  var data = querystring.stringify(req.body);
  // console.log('data = ', data);

  var options = {
    hostname: 'localhost',
    port: 50111,
    path: '/templeton/v1/hive',
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'content-length': Buffer.byteLength(data)
    }
  };

  console.log('req.body = ', req.body);

  var reqSolr = http.request(options, function(resSolr) {
    var lookupResult = '';

    resSolr.on('data', function(chunk) {
      console.log('BODY: ' + chunk);
      lookupResult += chunk;
    });

    resSolr.on('end', function() {
      console.log('lookupResult = ', lookupResult);

      var jobID = JSON.parse(lookupResult).id;
      console.log('lookupResult.id = ', jobID);
      // lookupResult =  {"id":"job_1412931102586_0012"}

      //http://localhost:50111/templeton/v1/jobs/:jobid?user.name=hue
      // job_response.status.completed = done

      // var hiveJobsApi = 'http://localhost:50111/templeton/v1/jobs/'+jobID+'?user.name=hue';
      // console.log('hiveJobsApi = ', hiveJobsApi);

      // TODO: Should also check for STATE=FAILED
      var checkJobStatus = function(jobid, callback) {
        var url = 'http://localhost:50111/templeton/v1/jobs/' + jobid + '?user.name=hue';
        console.log('url = ', url);

        var jobReq = http.get(url, function(jobsRes) {
          console.log('jobsRes.statusCode = ', jobsRes.statusCode);

          var jobStatus = '';

          jobsRes.on('data', function(chunk) {
            jobStatus += chunk;
          });

          jobsRes.on('end', function() {
            jobStatus = JSON.parse(jobStatus);
            // console.log('jobStatus = ',jobStatus);
            console.log('jobStatus.completed = ', jobStatus.completed);

            if (jobStatus.completed) {
              console.log('job completed!');
              callback(null, true);
            } else {
              console.log('job not completed yet.');
              setTimeout(function() {
                checkJobStatus(jobid, callback);
              }, 5000);
            }
          });
        }).on('error', function(e) {
          console.log('Got error: ' + e.message);
        });
      }

      // var jobStatus = checkJobStatus(jobID);
      // console.log('jobStatus = ',jobStatus);
      checkJobStatus(jobID, function(err, respJob) {
        console.log('checkJobStatus: jobID = ', jobID);
        console.log('checkJobStatus: respJob = ', respJob);

        // MR job is done. Grab the HDFS output file
        var url = 'http://localhost:50070/webhdfs/v1/user/hue/myoutput/stdout?op=OPEN';
        var hdfsReq = http.get(url, function(hdfsRes) {
          // console.log('hdfsReq started');

          hdfsRes.on('data', function(chunk) {
            // console.log('hdfsRes received chunk');
            outputData.push(chunk);
          });

          hdfsRes.on('end', function() {
            // console.log('hdfsRes.headers = ',hdfsRes.headers);

            if (hdfsRes.headers.location) {
              // follow the url redirect location to grab the HDFS file
              var hdfsFileReq = http.get(hdfsRes.headers.location, function(hdfsFileRes) {
                console.log('hdfsFileReq started');
                var outputData = [];
                hdfsFileRes.on('data', function(chunk) {
                  console.log('hdfsFileRes received chunk');
                  outputData.push(chunk);
                });

                hdfsFileRes.on('end', function() {
                  var buffer = Buffer.concat(outputData);
                  // console.log('buffer = ',buffer.toString('utf-8'));
                  var bufferArray = buffer.toString('utf-8').split(/\s/g);
                  console.log('bufferArray = ', bufferArray);
                  res.send(bufferArray);
                });
              }).on('error', function(e) {
                console.log('Got error: ' + e.message);
              });
            }
          });
        }).on('error', function(e) {
          console.log('Got error: ' + e.message);
        });
      });

      // res.send(lookupResult);
    });
  }).on('error', function(e) {
    console.log('Got error: ' + e.message);
  });

  // console.log('encodeURIComponent(JSON.stringify(req.body)) = ',encodeURIComponent(JSON.stringify(req.body)));
  // reqSolr.write(JSON.stringify(req.body));
  reqSolr.write(data);
  reqSolr.end();
});

// router.get('/testsolr/:designdoc/:view/:key', function(req, res) {
// res.send('Hello Solr');
// res.send(lookupResult);
// console.log('req.params = ',req.params);
// });

module.exports = router;