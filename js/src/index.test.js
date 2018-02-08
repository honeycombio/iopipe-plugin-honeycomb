import _ from 'lodash';
import iopipe from '@iopipe/core';
import mockContext from 'aws-lambda-mock-context';
import pkg from '../package.json';

jest.mock("./formatAndSend");

import HoneycombReport from './index';
import { invocations, formattedReports, reports } from './formatAndSend';

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
