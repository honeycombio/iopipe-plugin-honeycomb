export default function formatReport(report) {
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
