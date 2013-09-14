App = require 'config/app'

module.exports = App.DocumentsRoute = Ember.Route.extend
    activate: ->
        document.title = 'Poe'

    model: (params) ->
        (@get 'store').find 'document'

    actions:
        destroyRecord: (record) ->
            if window.confirm('Are you sure you want to delete this document?')
                record.deleteRecord()

                unless record.currentState.stateName is 'root.deleted.saved'
                    record.save()

                @transitionTo 'documents'
