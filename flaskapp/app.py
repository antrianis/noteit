"""
Contains the WSGI app and any other "singleton"-type objects:
database manager, oembed
"""

import os

from flask import Flask
from micawber import bootstrap_basic  # OEmbed widget
from peewee import SqliteDatabase  # ORM

APP_ROOT = os.path.dirname(os.path.realpath(__file__))
DATABASE = os.path.join(APP_ROOT, 'notesit.db')
DEBUG = True

app = Flask(__name__)
app.config.from_object(__name__)
db = SqliteDatabase(app.config['DATABASE'], threadlocals=True)
oembed = bootstrap_basic()
