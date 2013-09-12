App = require 'config/app'

module.exports = App.DocumentsRoute = Ember.Route.extend
    activate: ->
        document.title = 'Poe'

    model: (params) ->
        (@get 'store').find 'document'

    actions:
        destroyRecord: (document) ->
            if window.confirm('Are you sure you want to delete this document?')
                document.deleteRecord()

                unless document.currentState.stateName is 'root.deleted.saved'
                    document.save()

                @transitionTo 'documents'
