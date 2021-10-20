module.exports = function(RED) {
    const http = require("http");
    const xml2js = require("xml2js");
    const { DateTime } = require("luxon");

    function MetIe(config) {
        RED.nodes.createNode(this, config);
        this.lat = config.lat;
        this.long = config.long;

        var node = this;

        node.on('input', function(msg) {
            const now = DateTime.now().startOf("second");
            const dt = now.toISO({ suppressMilliseconds: true, suppressSeconds: true, includeOffset: false });
            const url = `http://metwdb-openaccess.ichec.ie/metno-wdb2ts/locationforecast?lat={node.lat};long={node.long};from={dt};to={dt}`;
            http.get(url, (res) => {
                const { statusCode } = res;
                if (statusCode !== 200) {
                    let error = new Error(`Request failed: ${statusCode}`);
                    console.error(error.message);
                    res.resume();
                    return;
                }

                res.setEncoding("utf8");
                let rawData = "";

                res.on("data", (chunk) => { rawData += chunk; });
                res.on("end", () => {
                    try {
                        xml2js.parseString(rawData, function(err, result) {
                            let current = result.weatherdata.product[0].time[0].location[0];
                            let rainCurrent = result.weatherdata.product[0].time[1].location[0];
                            let r = {};
                            r.payload = {
                                temperature: current.temperature[0].$.value,
                                windDirection: current.windDirection[0].$.name,
                                windDirectionDeg: current.windDirection[0].$.deg,
                                windSpeed: current.windSpeed[0].$.mps,
                                humidity: current.humidity[0].$.value,
                                pressure: current.pressure[0].$.value,
                                cloudiness: current.cloudiness[0].$.percent,
                                lowClouds: current.lowClouds[0].$.percent,
                                highClouds: current.highClouds[0].$.percent,
                                dewPoint: current.dewpointTemperature[0].$.value,
                                rain: rainCurrent.precipitation[0].$.value,
                                rainProbability: rainCurrent.precipitation[0].$.probability,
                            };
                        });
                    } catch (e) {
                        console.error(e.message);
                    }

                    node.send(r);
                });
            }).on("error", (e) => {
                console.error(`Got error: ${e.message}`);
            });

            // msg.payload = "HELLO WORLD";
            // node.send(msg);
        });
    }

    RED.nodes.registerType("met-ie", MetIe);
}
