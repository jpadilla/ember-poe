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
                @controllerFor('document').set 'isCreating', yes
                @transitionTo 'documents'

        destroyRecord: (document) ->
            if window.confirm('Are you sure you want to delete this document?')
                document.deleteRecord()

                unless document.currentState.stateName is 'root.deleted.saved'
                    document.save()

                @transitionTo 'documents'

        cancelNewRecord: (document) ->
            document.deleteRecord()
            @transitionTo 'documents'
