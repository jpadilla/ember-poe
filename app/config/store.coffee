App = require 'config/app'

module.exports = App.Store = DS.Store.extend
    revision: 13
    adapter: DS.LSAdapter.create()
