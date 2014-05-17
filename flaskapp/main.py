"""
This ties together our 3 python modules (app.py, models.py and views.py)
on a single entry-point named main.py.
Flask relies on import-time side-effects (for registering URL routes),
so this is just something nice to use.
"""

from app import app
from models import Note
import views


if __name__ == '__main__':
    Note.create_table(True)
    app.run()
