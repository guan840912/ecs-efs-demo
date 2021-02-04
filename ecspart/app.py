# -*- coding: utf-8 -*-
import os
from flask import Flask
import json
import logging
import subprocess

URL=os.getenv('URL', '0.0.0.0')
outdir = os.environ.get('TEST_OUTDIR', '/mnt/efsmount')
logger = logging.getLogger()
logger.setLevel(logging.INFO)

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index_page():
  finfile = getfile([outdir])
  api = {'1':'I'}
  api.update({'file': str(finfile)})
  return api

@app.route('/healthcheck', methods=['GET'])
def hc():
  return {'status': 'ok'}

def getfile(args):
    retry = 3
    while retry > 0:
        try:
            cmd = [ 'ls', '-R'] + args
            output = subprocess.check_output(cmd, stderr=subprocess.STDOUT)
        except subprocess.CalledProcessError as exc:
            output = exc.output
            if b'i/o timeout' in output and retry > 0:
                logger.info("timed out, retries left: %s" % retry)
                retry = retry - 1
            else:
                raise Exception(output)
        else:
            logger.info(output)
            return output

if __name__ == '__main__':
    app.run(host=URL,port=8080)