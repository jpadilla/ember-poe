App = require 'config/app'

module.exports = App.DocumentsNewRoute = Ember.Route.extend
    activate: ->
        document.title = 'New Document - Poe'

    renderTemplate: ->
        @render 'document'

    setupController: (controller, model) ->
        @controllerFor('document').set 'content', model
        @controllerFor('document').set 'isCreating', yes

    model: ->
        now = new Date()
        @store.createRecord 'document',
            title: 'Untitled.md'
            body: 'Content goes here...'
            createdAt: now
            updatedAt: now

    actions:
        save: ->
            @modelFor('documents.new').save().then =>
                @controllerFor('document').set 'isCreating', no
                @transitionTo 'documents'

        destroyRecord: (record) ->
            if window.confirm('Are you sure you want to delete this document?')
                record.deleteRecord()

                unless record.currentState.stateName is 'root.deleted.saved'
                    record.save()

                @transitionTo 'documents'

        cancelNewRecord: (record) ->
            record.deleteRecord()
            @transitionTo 'documents'
