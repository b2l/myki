// Libs
var marked = require('marked');
var p = require('page');

// Controllers
var EditorController = require('../controller/editorController');

// Views
var ListView = require('../views/pageListView');
var showView = require('../views/pageShowView');

// DOM Element
var $content = document.getElementById('content');
var $list = document.getElementById('nav2');

// Models
var Pages = require('../models/Pages');
var pagesStore = new Pages();

var controller = {
    // -- Middle ware -> affichage de la liste des page
    list: function(req, next) {
        if (this.listView) this.listView.destroy();

        this.listView = new ListView($list);

        pagesStore.getAll().then(function(allPages) {
            this.listView.render(allPages,  Number(req.params.pageId) || 0);
        }.bind(this));

        if (next) {
            next();
        }
    },

    // -- POST on créer la page
    savePage: function(req) {
        pagesStore.get(req.params.pageId).then(function(page) {        
            page.title = req.state.data.title;
            page.content = req.state.data.content;

            page.save().then(function() {
                req.unhandled = true;
                p.show('/page/' + p.id, {}, true);
            });

        });
    },

    addPage: function(req) {
        var page = new Pages();
        page.title = 'new page';
        page.content = '# new page';

        page.save().then(function(result) {
            var id = result;
            req.unhandled = true;
            p.show('/page/' + id + '/edit', {}, true);
        });
    },

    // -- GET on affiche une page
    showPage: function(req) {
        this.editorController ? this.editorController.destroy() : null;
        this.showView ? this.showView.destroy() : null;

        pagesStore.get(req.params.pageId).then(function(page) {
            this.showView = new showView($content);
            this.showView.render(page);
        });
    },

    editPage: function(req) {
        pagesStore.get(req.params.pageId).then(function(page) {
            this.editorController ? this.editorController.destroy() : null;
            this.editorController = new EditorController();
            this.editorController.edit(page);
        });
    },

    clearDb: function(req, next) {
        dbWrapper.page.clear();
        dbWrapper.files.clear();
        if (next) {
            next();
        }
    }
}

module.exports = controller;
