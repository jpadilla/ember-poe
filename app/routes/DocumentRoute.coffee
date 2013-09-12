App = require 'config/app'

module.exports = App.DocumentRoute = Ember.Route.extend
    activate: ->
        title = @modelFor('document').get 'title'
        document.title = "#{title} - Poe"

    actions:
        save: ->
            model = @modelFor('document')
            model.set 'updatedAt', new Date()

            model.save().then =>
                @transitionTo 'documents'

        destroyRecord: (document) ->
            if window.confirm('Are you sure you want to delete this document?')
                document.deleteRecord()

                unless document.currentState.stateName is 'root.deleted.saved'
                    document.save()

                @transitionTo 'documents'
