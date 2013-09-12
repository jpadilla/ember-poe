App = require 'config/app'

module.exports = App.IndexRoute = Ember.Route.extend
    redirect: ->
        @transitionTo 'documents'
