import formatReport from "./formatReport";

export default function formatAndSend(pluginInstance, report) {
    let { libhoney } = pluginInstance;
    let formattedReport = formatReport(report);
    let ev = libhoney.newEvent();
    ev.add(formattedReport);
    ev.send();
}

