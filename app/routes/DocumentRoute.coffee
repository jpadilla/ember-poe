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

        destroyRecord: (record) ->
            if window.confirm('Are you sure you want to delete this document?')
                record.deleteRecord()

                unless record.currentState.stateName is 'root.deleted.saved'
                    record.save()

                @transitionTo 'documents'

        downloadFile: (record) ->
            blob = new Blob([record.get 'body'],
                type: "text/plain;charset=utf-8"
            )

            title = record.get 'title'

            unless /.md|.mkdn?|.mdown|.markdown/.test(title)
                title += '.md'

            saveAs blob, title
