# Sphinx for Automated Documentation

A simple example and cheat sheet for using Sphinx to document small Python modules.

reStructured Text cheat sheet: [https://davidstutz.github.io/sphinx-example/#index](https://davidstutz.github.io/sphinx-example/#index)

## Installation

    $ sudo apt-get install python-sphinx
    $ sudo pip install sphinx
    # Depends on which version you prefer ...
    $ sudo pip3 install sphinx

## Quickstart

Sphinx offers an easy quickstart:

    $ mkdir docs
    $ cd docs
    # Quickstart, select yes for apidoc and mathjax and for splitting build and source.
    $ sphinx-quickstart
    $ sphinx

Choose to separate source and build directories, choose project name and version and the autodoc extension.

If the code/module to be documentation is accessable from the root directory, edit `docs/source/conf.py` as follows:

    import os
    import sys
    sys.path.insert(0, os.path.abspath('../../'))

Then the modules can be automatically documented using:

    $ sphinx-apidoc -f -o source/ ../
    $ make html