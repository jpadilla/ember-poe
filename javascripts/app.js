(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("config/app", function(exports, require, module) {
module.exports = Ember.Application.create({
  rootElement: '#application',
  LOG_TRANSITIONS: true
});

});

;require.register("config/routes", function(exports, require, module) {
var App;

App = require('config/app');

module.exports = App.Router.map(function() {
  this.route('documents');
  this.route('documents_new', {
    path: 'documents/new'
  });
  return this.route('document', {
    path: 'documents/:document_id'
  });
});

});

;require.register("config/store", function(exports, require, module) {
var App;

App = require('config/app');

module.exports = App.Store = DS.Store.extend({
  revision: 13,
  adapter: DS.LSAdapter.create()
});

});

;require.register("controllers/DocumentController", function(exports, require, module) {
var App;

App = require('config/app');

module.exports = App.DocumentController = Ember.ObjectController.extend({
  isCreating: false
});

});

;require.register("controllers/DocumentsController", function(exports, require, module) {
var App;

App = require('config/app');

module.exports = App.DocumentsController = Ember.ArrayController.extend({
  sortProperties: ['updatedAt'],
  sortAscending: false
});

});

;require.register("helpers/date", function(exports, require, module) {
module.exports = Ember.Handlebars.registerBoundHelper('date', function(date) {
  return moment(date).fromNow();
});

});

;require.register("helpers/markdown", function(exports, require, module) {
var showdown;

showdown = new Showdown.converter();

module.exports = Ember.Handlebars.registerBoundHelper('markdown', function(input) {
  return new Ember.Handlebars.SafeString(showdown.makeHtml(input));
});

});

;require.register("initialize", function(exports, require, module) {
window.App = require('config/app');

require('config/routes');

require('config/store');

require('routes/IndexRoute');

require('routes/DocumentRoute');

require('routes/DocumentsRoute');

require('routes/DocumentsNewRoute');

require('models/Document');

require('controllers/DocumentController');

require('controllers/DocumentsController');

require('helpers/markdown');

require('helpers/date');

require('templates/application');

require('templates/index');

require('templates/documents');

require('templates/document');

});

;require.register("models/Document", function(exports, require, module) {
var App;

App = require('config/app');

module.exports = App.Document = DS.Model.extend({
  title: DS.attr('string'),
  body: DS.attr('string'),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date')
});

});

;require.register("routes/DocumentRoute", function(exports, require, module) {
var App;

App = require('config/app');

module.exports = App.DocumentRoute = Ember.Route.extend({
  activate: function() {
    var title;
    title = this.modelFor('document').get('title');
    return document.title = "" + title + " - Poe";
  },
  actions: {
    save: function() {
      var model,
        _this = this;
      model = this.modelFor('document');
      model.set('updatedAt', new Date());
      return model.save().then(function() {
        return _this.transitionTo('documents');
      });
    },
    destroyRecord: function(record) {
      if (window.confirm('Are you sure you want to delete this document?')) {
        record.deleteRecord();
        if (record.currentState.stateName !== 'root.deleted.saved') {
          record.save();
        }
        return this.transitionTo('documents');
      }
    },
    downloadFile: function(record) {
      var blob, title;
      blob = new Blob([record.get('body')], {
        type: "text/plain;charset=utf-8"
      });
      title = record.get('title');
      if (!/.md|.mkdn?|.mdown|.markdown/.test(title)) {
        title += '.md';
      }
      return saveAs(blob, title);
    }
  }
});

});

;require.register("routes/DocumentsNewRoute", function(exports, require, module) {
var App;

App = require('config/app');

module.exports = App.DocumentsNewRoute = App.DocumentRoute.extend({
  activate: function() {
    return document.title = 'New Document - Poe';
  },
  renderTemplate: function() {
    return this.render('document');
  },
  setupController: function(controller, model) {
    this.controllerFor('document').set('content', model);
    return this.controllerFor('document').set('isCreating', true);
  },
  model: function() {
    var now;
    now = new Date();
    return this.store.createRecord('document', {
      title: 'Untitled.md',
      body: 'Content goes here...',
      createdAt: now,
      updatedAt: now
    });
  },
  actions: {
    save: function() {
      var _this = this;
      return this.modelFor('documents.new').save().then(function() {
        _this.controllerFor('document').set('isCreating', false);
        return _this.transitionTo('documents');
      });
    },
    cancelNewRecord: function(record) {
      record.deleteRecord();
      this.controllerFor('document').set('isCreating', false);
      return this.transitionTo('documents');
    }
  }
});

});

;require.register("routes/DocumentsRoute", function(exports, require, module) {
var App;

App = require('config/app');

module.exports = App.DocumentsRoute = Ember.Route.extend({
  activate: function() {
    return document.title = 'Poe';
  },
  model: function(params) {
    return (this.get('store')).find('document');
  },
  actions: {
    destroyRecord: function(record) {
      if (window.confirm('Are you sure you want to delete this document?')) {
        record.deleteRecord();
        if (record.currentState.stateName !== 'root.deleted.saved') {
          record.save();
        }
        return this.transitionTo('documents');
      }
    }
  }
});

});

;require.register("routes/IndexRoute", function(exports, require, module) {
var App;

App = require('config/app');

module.exports = App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    return this.transitionTo('documents');
  }
});

});

;require.register("templates/application", function(exports, require, module) {
Ember.TEMPLATES['application'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashTypes, hashContexts, escapeExpression=this.escapeExpression;


  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n");
  return buffer;
  
});
});

;require.register("templates/document", function(exports, require, module) {
Ember.TEMPLATES['document'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n                <a href=\"#\" class=\"btn btn-default pull-left\" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancelNewRecord", "", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">&larr; Go back</a>\n            ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n                ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("btn btn-default pull-left")
  },inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "documents", options) : helperMissing.call(depth0, "link-to", "documents", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program4(depth0,data) {
  
  
  data.buffer.push(" &larr; Go back");
  }

  data.buffer.push("<div class=\"document\">\n    <div class=\"left-pane\">\n        <form class=\"form-inline\" role=\"form\">\n            ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "controller.isCreating", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            <div class=\"pull-right\">\n                <div class=\"form-group\">\n                    ");
  hashContexts = {'valueBinding': depth0,'class': depth0};
  hashTypes = {'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
    'valueBinding': ("title"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n                </div>\n                <button class=\"btn btn-primary\" ");
  hashContexts = {'disabled': depth0};
  hashTypes = {'disabled': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'disabled': ("isProcessing")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "save", {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Save and Close</button>\n                <button class=\"btn btn-danger\" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "destroyRecord", "", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">Delete</button>\n            </div>\n            ");
  hashContexts = {'valueBinding': depth0};
  hashTypes = {'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
    'valueBinding': ("body")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        </form>\n    </div>\n    <div class=\"right-pane\">\n        <div class=\"markdown-header\">\n            <h1>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</h1>\n            <button type=\"button\" class=\"btn btn-default download-file-btn\" ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "downloadFile", "", {hash:{},contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n                <span class=\"glyphicon glyphicon-save\"></span> Download\n            </button>\n        </div>\n        <div class=\"markdown\">\n            ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.markdown || depth0.markdown),stack1 ? stack1.call(depth0, "body", options) : helperMissing.call(depth0, "markdown", "body", options))));
  data.buffer.push("\n        </div>\n    </div>\n</div>");
  return buffer;
  
});
});

;require.register("templates/documents", function(exports, require, module) {
Ember.TEMPLATES['documents'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("Create");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
  data.buffer.push("\n            ");
  hashContexts = {'tagName': depth0,'class': depth0,'href': depth0};
  hashTypes = {'tagName': "STRING",'class': "STRING",'href': "BOOLEAN"};
  options = {hash:{
    'tagName': ("li"),
    'class': ("documents-list-item"),
    'href': (false)
  },inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "document", "", options) : helperMissing.call(depth0, "link-to", "document", "", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, hashContexts, hashTypes, options;
  data.buffer.push("\n                <a href=\"#\" class=\"document-title\" ");
  hashContexts = {'href': depth0};
  hashTypes = {'href': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'href': ("view.href")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "title", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</a>\n                <a href=\"#\" class=\"document-destroy\" ");
  hashContexts = {'bubbles': depth0};
  hashTypes = {'bubbles': "BOOLEAN"};
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "destroyRecord", "", {hash:{
    'bubbles': (false)
  },contexts:[depth0,depth0],types:["STRING","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">x</a>\n                <span class=\"document-date\">Updated ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.date || depth0.date),stack1 ? stack1.call(depth0, "updatedAt", options) : helperMissing.call(depth0, "date", "updatedAt", options))));
  data.buffer.push("</span>\n            ");
  return buffer;
  }

  data.buffer.push("<div class=\"documents\">\n    <div class=\"header\">\n        <h1 class=\"logo\">Poe</h1>\n        ");
  hashContexts = {'class': depth0};
  hashTypes = {'class': "STRING"};
  options = {hash:{
    'class': ("create-document-link")
  },inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "documents_new", options) : helperMissing.call(depth0, "link-to", "documents_new", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    </div>\n    <ul class=\"documents-list\">\n        ");
  hashTypes = {};
  hashContexts = {};
  stack2 = helpers.each.call(depth0, "controller", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    </ul>\n</div>");
  return buffer;
  
});
});

;require.register("templates/index", function(exports, require, module) {
Ember.TEMPLATES['index'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashTypes, hashContexts;
  data.buffer.push("\n    <li>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "item", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</li>\n  ");
  return buffer;
  }

  data.buffer.push("<h2>Welcome to Ember.js</h2>\n<ul>\n  ");
  hashTypes = {};
  hashContexts = {};
  stack1 = helpers.each.call(depth0, "item", "in", "content", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</ul>\n");
  return buffer;
  
});
});

;
//@ sourceMappingURL=app.js.map