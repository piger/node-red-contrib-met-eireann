# node-red-contrib-met-eireann

A [met-eireann](https://www.met.ie/) node for [Node-RED](https://nodered.org/).

## Install

Run `npm install` from your Node-RED user data directory (e.g. `~/.node-red`):

```
$ npm install node-red-contrib-met-eireann
```

## Usage

The `msg.payload` contents are:

| name | unit | description |
|------|------|-------------|
| `temperature` | Celsius | Air temperature 2m above the ground |
| `windDirection` | Cardinal direction | Direction of the wind (e.g. `S` or `NW`) |
| `windDirectionDeg` | Degrees | Direction of the wind (e.g. `187.7`) |
| `windSpeed` | Meters per second | Wind speed |
| `windSpeedBeaufort` | Beaufort scale | Wind speed |
| `globalRadiation` | Watt per square meter (W/m^2) | Solar irradiance |
| `humidity` | Percentage | Relative humidity |
| `pressure` | hPa | Pressure |
| `cloudiness` | Percentage | General level of cloudiness |
| `lowClouds` | Percentage | Low cloud cover |
| `mediumClouds` | Percentage | Medium cloud cover |
| `highClouds` | Percentage | High cloud cover |
| `dewPoint` | Celsius | Dewpoint temperature |
| `rain` | Millimeters | Rainfall accumulation |
| `rainProbability` | Percentage? | Probability of rainfall |

The [API](https://data.gov.ie/dataset/met-eireann-weather-forecast-api) is part of
[Ireland's Open Data Portal](https://data.gov.ie/).
