export let invocations = [];
export let formattedReports = [];
export let reports = [];

import formatReport from "../formatReport";

export default function formatAndSend(pluginInstance, report) {
    let { invocationInstance } = pluginInstance;
    let formattedReport = formatReport(report);
    invocations.push(invocationInstance);
    formattedReports.push(formattedReport);
    reports.push(report);
}
