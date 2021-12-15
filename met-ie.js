/* metEireannForecastNode - the main node in this package. */

module.exports = function (RED) {
    'use strict';

    const http = require("http");
    const xml2js = require("xml2js");
    const { DateTime } = require("luxon");

    /**
     * 
     * @param {*} config - configuration for this node.
     */
    function metEireannForecastNode(config) {
        RED.nodes.createNode(this, config);
        this.lat = config.lat;
        this.long = config.long;
        const node = this;

        node.on('input', function (msg, send, done) {
            // compatibility with Node-RED 0.x
            send = send || function(...args) { node.send.apply(node, args) };
            done = done || function(text, msg) { if (text) { node.error(text, msg); } };

            node.status({
                fill: "blue",
                shape: "dot",
                text: "weather.status.requesting"
            });

            const now = DateTime.now().startOf('hour').toISO({
                suppressMilliseconds: true,
                suppressSeconds: true,
                includeOffset: false
            });
            const url = `http://metwdb-openaccess.ichec.ie/metno-wdb2ts/locationforecast?lat=${node.lat};long=${node.long};from=${now};to=${now}`;

            http.get(url, (res) => {
                const { statusCode } = res;

                if (statusCode !== 200) {
                    let error = new Error(`Request failed: ${statusCode}`);
                    node.error(error.message);
                    res.resume();
                    done(error);
                    return;
                }
                
                res.setEncoding("utf8");
                let rawData = "";
                let error;

                res.on("data", (chunk) => { rawData += chunk; });
                
                res.on("end", () => {
                    let opts = {
                        valueProcessors: [ xml2js.processors.parseNumbers ],
                        attrValueProcessors: [ xml2js.processors.parseNumbers ]
                    }

                    try {
                        xml2js.parseString(rawData, opts, function (err, result) {
                            if (err) {
                                error = err;
                            } else {
                                let current = result.weatherdata.product[0].time[0].location[0];
                                let rainCurrent = result.weatherdata.product[0].time[1].location[0];

                                msg.payload = {
                                    temperature: current.temperature[0].$['value'],
                                    windDirection: current.windDirection[0].$['name'],
                                    windDirectionDeg: current.windDirection[0].$['deg'],
                                    windSpeed: current.windSpeed[0].$['mps'],
                                    windSpeedBeaufort: current.windSpeed[0].$['beaufort'],
                                    globalRadiation: current.globalRadiation[0].$['value'],
                                    humidity: current.humidity[0].$['value'],
                                    pressure: current.pressure[0].$['value'],
                                    cloudiness: current.cloudiness[0].$['percent'],
                                    lowClouds: current.lowClouds[0].$['percent'],
                                    mediumClouds: current.mediumClouds[0].$['percent'],
                                    highClouds: current.highClouds[0].$['percent'],
                                    dewPoint: current.dewpointTemperature[0].$['value'],
                                    rain: rainCurrent.precipitation[0].$['value'],
                                    rainProbability: rainCurrent.precipitation[0].$['probability']
                                };
                            }
                        });
                    } catch (e) {
                        console.error(e.message);
                        // done(e);
                        error = e;
                    }

                    if (error) {
                        done(error);
                    } else {
                        send(msg);
                    }
                });

            }).on("error", (e) => {
                console.error(`Got error: ${e.message}`);
                done(e);
            });

            node.status({});
        }); // end node('on')
    } // end metEireannForecastNode

    RED.nodes.registerType("met-ie", metEireannForecastNode);
}
