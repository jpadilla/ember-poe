showdown = new Showdown.converter()

module.exports = Ember.Handlebars.registerBoundHelper 'markdown', (input) ->
    new Ember.Handlebars.SafeString showdown.makeHtml(input)