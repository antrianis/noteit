# coding: utf-8

"""
Contains the app models and some convenient methods
for them on this app's context.
"""

import datetime

from flask import Markup
from markdown import markdown
from micawber import parse_html
from peewee import *

from app import db, oembed


class Note(Model):

    title = TextField()
    content = TextField()
    categories = TextField()

    timestamp = DateTimeField(default=datetime.datetime.now)
    archived = BooleanField(default=False)

    class Meta:
        database = db

    def html(self):
        """
        Convenience method. Runs the content through markdown,
        converts links into objects where possible,
        and returns the HTML code.
        """

        html = parse_html(
            markdown(self.content),
            oembed,
            maxwidth=300,
            urlize_all=True)
        return Markup(html)

    @classmethod
    def public(cls):
        """
        Convenience method. Returns a query representing
        the notes I want to see displayed when I pull up
        the page.
        """
        return (Note
                .select()
                .where(Note.archived == False)
                .order_by(Note.timestamp.desc()))
