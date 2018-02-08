import Libhoney from "libhoney";
import process from "process";
import pkg from '../package.json';

import formatAndSendToHoneycomb from "./formatAndSend";

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
        formatAndSendToHoneycomb(this, report.report.report);
        this.libhoney.close();
    }
}
export default function instantiatePlugin(pluginOpts) {
    return invocationInstance => {
        return new HoneycombReport(pluginOpts, invocationInstance);
    };
}