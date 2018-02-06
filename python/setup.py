from setuptools import find_packages, setup

setup(
    name='iopipe-plugin-honeycomb',
    version='0.1.0',
    description='Honeycomb plugin for IOpipe',
    author='Honeycomb & IOpipe',
    author_email='support@honeycomb.io',
    url='https://github.com/honeycombio/iopipe-plugin-honeycomb',
    packages=find_packages(exclude=('tests', 'tests.*',)),
    install_requires=['iopipe>=1.0.0', 'libhoney'],
    setup_requires=['pytest-runner'],
    tests_require=['mock', 'pytest', 'requests'],
    zip_safe=True)
