import copy
import json
import logging
import os

import libhoney
from iopipe.plugins import Plugin

from .send_honeycomb import format_report, send_honeycomb

logger = logging.getLogger(__name__)


class HoneycombReport(Plugin):
    def __init__(self, **config):
        self.config = config
        self.config.setdefault('writekey', os.getenv('HONEYCOMB_WRITEKEY', 'unsetwk'))
        self.config.setdefault('dataset', os.getenv('HONEYCOMB_DATASET', 'unsetds'))
        self.config.setdefault('sample_rate', os.getenv('HONEYCOMB_SAMPLE_RATE', 1))

        try:
            self.config['sample_rate'] = int(self.config['sample_rate'])
        except ValueError:
            self.config['sample_rate'] = 1

        if self.config['sample_rate'] < 1:
            self.config['sample_rate'] = 1

        logger.debug('Initializing Honeycomb Plugin with:\n{}'.format(json.dumps(self.config, indent=4)))

    @property
    def name(self):
        return 'honeycomb-report'

    @property
    def version(self):
        return '0.1.0'

    @property
    def homepage(self):
        return 'https://github.com/honeycombio/iopipe-plugin-honeycomb/'

    @property
    def enabled(self):
        return True

    def pre_setup(self, iopipe):
        pass

    def post_setup(self, iopipe):
        libhoney.init(**self.config)

    def pre_invoke(self, event, context):
        pass

    def post_invoke(self, event, context):
        pass

    def pre_report(self, report):
        pass

    def post_report(self, report):
        local_rep = copy.deepcopy(report.report)
        format_report(local_rep)

        try:
            send_honeycomb(local_rep, self.config)
        except Exception as e:
            logger.debug('caught exception while sending honeycomb report: {}'.format(e))
        else:
            logger.debug('sent report to honeycomb')

        responses = libhoney.responses()
        resp = responses.get()
        if resp is None:
            logger.info('no response from honeycomb')
        else:
            logger.debug('got response from Honeycomb: {}'.format(resp))
        libhoney.close()
