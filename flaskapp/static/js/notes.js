Notes = window.Notes || {};

/* a self-evaluating anonymous function */
(function(exports, $) {

    /* 
        The Editor object constructor. This constructor locates
        the important DOM elements and then sets up the various
        event handlers.
    */
    function Editor() {
        this.form = $('form#note-form');
        this.editor = $('textarea#content');
        this.container = $('ul.notes');
        this.initialize();
    }

    Editor.prototype.initialize = function() {
        this.setupMasonry();
        this.setupNotes();
        this.setupForm();
        this.editor.focus();
    }

    /* 
        Set up the masonry plugin. Waits until all the images are loaded 
        before calling masonry:
    */
    Editor.prototype.setupMasonry = function() {
        var self = this;
        imagesLoaded(this.container, function() {
            self.container.masonry({'itemSelector': '.note'});
        });
    }

    /* 
        setupNotes is very minimal and is only responsible for
        binding an event handler to the close button 
        in the corner of each note on display. 
        When clicked this should trigger an Ajax request 
        that archives the note, then removes it from the DOM.
    */
    Editor.prototype.setupNotes = function() {
        var self = this;
        $('a.archive-note').on('click', this.archiveNote);
    }

    Editor.prototype.archiveNote = function(e) {
        e.preventDefault();
        var elem = $(this);
        var panel = elem.parents('.panel');
        var self = this;
        $.post(elem.attr('href'), function(data) {
            if (data.success) {
                panel.remove();
                $('ul.notes').masonry();
            }
        });
    }

    /* 
    Sets up the notes form. I like using Ctrl+Enter on my laptop to trigger
    a form submission, so we'll need to add a keydown event handler. 
    Then, since the form submit needs to happen via Ajax, 
    we'll bind a handler to the form's submit event. 
    Most importantly, we need to set up some helpers for working with markdown. 
    Because they were easy to implement, I've only added 
    a few toolbar buttons, but hopefully they will alleviate 
    some of the pain in writing markdown from a phone keyboard. They are:
        - Indent 4 spaces
        - Dedent 4 characters
        - Convert lines to an unordered list
        - Bold
        - Italics
        - Select All
    */
    Editor.prototype.setupForm = function() {
        var self = this;

        this.editor.on('keydown', function(e) {
            if (e.ctrlKey && e.keyCode == 13) {
                self.form.submit();
            }
        });

        this.form.submit(function(e) {
            e.preventDefault();
            self.addNote();
        });

        this.addMarkdownHelpers();
    }

    /*
    Submits a note via Ajax, then adding the rendered content 
    to the list of other notes in the DOM.
    */
    Editor.prototype.addNote = function() {
        var self = this;
        this.editor.css('color', '#464545');
        $.post(this.form.attr('target'), this.form.serialize(), function(data) {
            if (data.success) {
                self.editor.val('').focus();
                listElem = $(data.note);
                listElem.find('a.archive-note').on('click', self.archiveNote);
                self.container.prepend(listElem);
                self.container.masonry('prepended', listElem);
            } else {
                self.editor.css('color', '#dd1111');
            }
        });
    }

    /*
    Adds the toolbar buttons, specifying a callback 
    that will operate on each line of selected text 
    (or in the case of select all, the entire text):
    */
    Editor.prototype.addMarkdownHelpers = function() {
        var self = this;
        this.addHelper('indent-left', function(line) {
            return '    ' + line;
        });
        this.addHelper('list', function(line) {
            return '* ' + line;
        });
        this.addHelper('bold', function(line) {
            return '**' + line + '**';
        });
        this.addHelper('italic', function(line) {
            return '*' + line + '*';
        });
        this.addHelper('font', null, function() {
            self.editor.focus();
            self.editor.select();
        });
    }

    /*
    The addHelper() function does all the dirty work 
    of modifying the selected text. Below are also 
    several other utility functions.
    */
    Editor.prototype.addHelper = function(iconClass, lineHandler, callBack) {
        var link = $('<a>', {'class': 'btn btn-xs'}),
            icon = $('<span>', {'class': 'glyphicon glyphicon-' + iconClass}),
            self = this;

        if (!callBack) {
            callBack = function() {
                self.modifySelection(lineHandler);
            }
        }

        link.on('click', function(e) {
            e.preventDefault();
            callBack();
        });

        link.append(icon);
        this.editor.before(link);
    }

    Editor.prototype.modifySelection = function(lineHandler) {
        var selection = this.getSelectedText();
        if (!selection) return;

        var lines = selection.split('\n'),
            result = [];

        for (var i = 0; i < lines.length; i++) {
            result.push(lineHandler(lines[i]));
        }

        this.editor.val(
            this.editor.val().split(selection).join(result.join('\n'))
        );
    }

    Editor.prototype.getSelectedText = function() {
        var textAreaDOM = this.editor[0];
        return this.editor.val().substring(
            textAreaDOM.selectionStart,
            textAreaDOM.selectionEnd);
    }

    /* Exports the Editor constructor */
    exports.Editor = Editor;

})(Notes, jQuery);

