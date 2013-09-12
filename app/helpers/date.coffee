module.exports = Ember.Handlebars.registerBoundHelper 'date', (date) ->
    moment(date).fromNow()