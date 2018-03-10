# Honeycomb Plugin for IOpipe

This plugin sends a copy of the iopipe report to Honeycomb. In order to use this plugin, you must have an account with Honeycomb. You can sign up at https://honeycomb.io/signup.

## Usage

To enable this plugin, include it and enable it in your initialization of iopipe:

``` js
const iopipeLib = require('@iopipe/iopipe');
const honeycombReport = require('iopipe-plugin-honeycomb');

const iopipe = iopipeLib({
  token: 'TOKEN_HERE',
  plugins: [honeycombReport()]
});
```

## Configuration

The plugin needs some configuration:

* Honeycomb write key (available from https://ui.honeycomb.io/account)
* Honeycomb dataset name (your choice)
* Sample Rate (optional, defaults to 1)

All three of these attributes can be configured via Lambda environment variables (in the same way the IOpipe Token is configured).  Set the following variables:

* Write key: `HONEYCOMB_WRITEKEY`
* Dataset name: `HONEYCOMB_DATASET`
* Sample Rate: `HONEYCOMB_SAMPLE_RATE`

They can also be provided directly in code:

```js
const iopipe = iopipeLib({
  token: 'TOKEN_HERE',
  plugins: [honeycombReport({
      writeKey: "WRITEKEY_HERE",
      dataset: "DATASET_HERE",
      sampleRate: 1
  })]
});
```

It is strongly advised that (after the dataset has been created) you enable unpacking of nested JSON (configurable at the bottom of the Schema page).

Once the plugin is configured and successfully sending events to Honeycomb, you can augment the events with the iopipe `log` function call. Use it to record any measurements you want to take or attributes of your function you wish to use in Honeycomb. This can include timers, user IDs, log lines indicating branching, and so on.

This plugin also works well with the `TracePlugin` - if you enable it as well, all the tracing data will automatically be included in the reports sent to Honeycomb.
