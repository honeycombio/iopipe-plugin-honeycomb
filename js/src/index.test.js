import _ from 'lodash';
import iopipe from '@iopipe/core';
import tracePlugin from '@iopipe/trace';
import mockContext from 'aws-lambda-mock-context';
import pkg from '../package.json';

jest.mock("./formatAndSend");

import HoneycombReport from './index';
import { invocations, formattedReports, reports, reset } from './formatAndSend';

test('Can instantiate the plugin with no options', () => {
  const plugin = HoneycombReport();
  const inst = plugin({});
  expect(_.isFunction(inst.hooks['post:setup'])).toBe(true);
  expect(_.isFunction(inst.postSetup)).toBe(true);
  expect(_.isFunction(inst.hooks['post:report'])).toBe(true);
  expect(_.isFunction(inst.postReport)).toBe(true);
  expect(_.isPlainObject(inst.config)).toBe(true);
  expect(inst.meta.name).toBe('iopipe-plugin-honeycomb');
  expect(inst.meta.version).toBe(pkg.version);
  expect(inst.meta.homepage).toBe(pkg.homepage);
});

test('Works with iopipe custom metrics', async () => {
  try {
    reset();
    const iopipeInstance = iopipe({ token: 'test', plugins: [HoneycombReport()] });
    const wrappedFn = iopipeInstance(async (event, context) => {
      context.iopipe.log('answer-to-everything', 42);
      context.iopipe.log('metrics-can-be-strings-too', 'a neat value');
      context.succeed('wow');
    });
    const context = mockContext({ functionName: 'test-1' });
    wrappedFn({}, context);

    const val = await context.Promise;
    expect(val).toBe('wow');

    expect(reports.length).toBe(1);
    expect(invocations.length).toBe(1);
    expect(formattedReports.length).toBe(1);

    const report = reports[0];
    const formattedReport = formattedReports[0];

    expect(report.custom_metrics).toEqual([
      { name: "answer-to-everything", n: 42 },
      { name: "metrics-can-be-strings-too", s: "a neat value"}
    ]);
    expect(report.custom).toBeUndefined();
    
    expect(formattedReport.custom).toEqual({
      "answer-to-everything": 42,
      "metrics-can-be-strings-too": "a neat value"
    });
  } catch (err) {
    throw err;
  }
});

test('works with iopipe trace plugin output', async () => {
  try {
    reset();
    const iopipeInstance = iopipe({ token: 'test', plugins: [tracePlugin(), HoneycombReport()] });
    const wrappedFn = iopipeInstance(async (event, context) => {
      context.iopipe.mark.start("deep-thought");
      context.iopipe.log('answer-to-everything', 42);
      context.iopipe.mark.end("deep-thought");
      context.succeed('wow');
    });
    const context = mockContext({ functionName: 'test-1' });
    wrappedFn({}, context);

    const val = await context.Promise;
    expect(val).toBe('wow');

    expect(reports.length).toBe(1);
    expect(invocations.length).toBe(1);
    expect(formattedReports.length).toBe(1);

    const report = reports[0];
    const formattedReport = formattedReports[0];

    // metrics report
    expect(report.custom_metrics).toEqual([
      { name: "answer-to-everything", n: 42 },
    ]);
    expect(report.custom).toBeUndefined();
    expect(formattedReport.custom).toEqual({
      "answer-to-everything": 42,
    });

    // tracing report
    expect(report.performanceEntries).toEqual([
      { name: "start:deep-thought",
      entryType: "mark",
      duration: report.performanceEntries[0].duration,
      startTime: report.performanceEntries[0].startTime,
      timestamp: report.performanceEntries[0].timestamp
     },
      { name: "measure:deep-thought",
      entryType: "measure",
      duration: report.performanceEntries[1].duration,
      startTime: report.performanceEntries[1].startTime,
      timestamp: report.performanceEntries[1].timestamp
    },
      { name: "end:deep-thought",
      entryType: "mark",
      duration: report.performanceEntries[2].duration,
      startTime: report.performanceEntries[2].startTime,
      timestamp: report.performanceEntries[2].timestamp
    },
    ])
    expect(report.traces).toBeUndefined();
    expect(formattedReport.traces).toEqual({
      "start:deep-thought": {
        duration: report.performanceEntries[0].duration,
        entryType: report.performanceEntries[0].entryType,
        startTime: report.performanceEntries[0].startTime,
        timestamp: report.performanceEntries[0].timestamp,
      },
      "measure:deep-thought": {
        duration: report.performanceEntries[1].duration,
        entryType: report.performanceEntries[1].entryType,
        startTime: report.performanceEntries[1].startTime,
        timestamp: report.performanceEntries[1].timestamp,
      },
      "end:deep-thought": {
        duration: report.performanceEntries[2].duration,
        entryType: report.performanceEntries[2].entryType,
        startTime: report.performanceEntries[2].startTime,
        timestamp: report.performanceEntries[2].timestamp,
      }
    });
  } catch (err) {
    throw err;
  }
});