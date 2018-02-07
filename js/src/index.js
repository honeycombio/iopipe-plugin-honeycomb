import Libhoney from "libhoney";
import process from "process";
import pkg from '../package.json';

function getConfig(config = {}) {
  const { writeKey = process.env["HONEYCOMB_WRITEKEY"],
          dataset = process.env["HONEYCOMB_DATASET"],
          sampleRate = process.env["HONEYCOMB_SAMPLE_RATE"] } = config;
  return {
      writeKey,
      dataset,
      sampleRate,
  };
}

function formatReport(report) {
    // shallow clone report first
    let formatted = { ...report };

    // custom metrics are an array of objects of the format: {name: string, n: number, s: string}
    if (formatted.custom_metrics) {
        let custom = {};
        for (let log of formatted.custom_metrics) {
            const { name, n, s } = log;
            let val;
            
            if (typeof n !== "undefined") {
                val = n;
            } else if (typeof s !== "undefined") {
                val = s;
            } else {
                custom['hny_translation_err'] = `not_n_or_s for key ${name}`;
            }
            custom[name] = val;
        }
        formatted.custom = custom;
    }

    // munge tracing plugin's contributions. this will likely need improvement
    // for example, could pull out matching start/end segments and calculate stuff...
    // [{"duration":0,"entryType":"mark","name":"start:iopipe","startTime":24674,"timestamp":1514940704792},
    // {"duration":0,"entryType":"mark","name":"end:iopipe","startTime":3229406,"timestamp":1514940704795}]
    if (formatted.performanceEntries) {
        let traces = {};
        for (let mark of formatted.performanceEntries) {
            let { name, duration, entryType, startTime, timestamp } = mark;
            traces[name] = { duration, entryType, startTime, timestamp };
        }
        formatted.traces = traces;
    }

    return formatted;
}

class HoneycombReport {
    constructor(config = {}, invocationInstance) {
        this.invocationInstance = invocationInstance;
        this.config = getConfig(config);

        this.config.sampleRate = parseInt(this.config.sampleRate);
        // we can't use <= here since sampleRate might be NaN
        if (!(this.config.sampleRate > 0)) {
            this.config.sampleRate = 1;
        }
        this.hooks = {
            'post:setup': this.postSetup,
            'post:report': this.postReport,
        }
    }
    get meta() {
        return { name: pkg.name, version: pkg.version, homepage: pkg.homepage };
    }

    postSetup = () => {
        this.libhoney = new Libhoney(this.config);
    }

    postReport = (report) => {
        let formattedReport = formatReport(report);
        let ev = this.libhoney.newEvent();
        ev.add(formattedReport);
        ev.send();
        this.libhoney.close();
    }
}
export default function instantiatePlugin(pluginOpts) {
    return invocationInstance => {
        return new HoneycombReport(pluginOpts, invocationInstance);
    };
}