App = require 'config/app'

module.exports = App.Document = DS.Model.extend
    title: DS.attr 'string'
    body: DS.attr 'string'
    createdAt: DS.attr 'date'
    updatedAt: DS.attr 'date'
