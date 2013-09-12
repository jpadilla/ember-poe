App = require 'config/app'

module.exports = App.DocumentsController = Ember.ArrayController.extend
    sortProperties: ['updatedAt']
    sortAscending: false
