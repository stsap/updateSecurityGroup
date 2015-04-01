var request = require('request');
var q = require('q');
var aws = require('aws-sdk');
aws.Request.prototype.promise = function () {
    var deferred = require("q").defer();
    this.on("complete", function (res) {
        if (res.error) deferred.reject(res.error);
        else deferred.resolve(res.data);
    });
    this.send();
    return deferred.promise;
};

aws.config.loadFromPath("config/credentials.json");

getIpAddress().
    then(function (result) {
        var params = {
            CidrIp: result + '/32',
            DryRun: false,
            FromPort: 0,
            ToPort: 0,
            IpProtocol: '-1',
            GroupId: '',
        };
        return new aws.EC2().authorizeSecurityGroupIngress(params).promise();
    });


function getIpAddress () {
    var defer= require('q').defer();
    var options = {url: 'http://info.ddo.jp/remote_addr.php'};
    request.get(options, function (error, res, body) {
        if (error || res.statusCode !== 200)
            defer.reject({error: error, response: res});
        defer.resolve(body.match(/(?:\d{1,3}\.){3}\d{1,3}/)[0]);
    });
    return defer.promise;
}
