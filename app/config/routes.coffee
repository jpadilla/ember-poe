App = require 'config/app'

module.exports = App.Router.map ->
    @route 'documents'
    @route 'documents_new', {path: 'documents/new'}
    @route 'document', {path: 'documents/:document_id'}
