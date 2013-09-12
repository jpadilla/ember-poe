# ===== Config =====
window.App = require 'config/app'
require 'config/routes'
require 'config/store'

# ===== Routes =====
require 'routes/IndexRoute'
require 'routes/DocumentRoute'
require 'routes/DocumentsRoute'
require 'routes/DocumentsNewRoute'

# ===== Models =====
require 'models/Document'


# ===== Controllers =====
require 'controllers/DocumentController'
require 'controllers/DocumentsController'


# ===== Template Helpers =====
require 'helpers/markdown'
require 'helpers/date'


# ===== Templates =====
require 'templates/application'
require 'templates/index'
require 'templates/documents'
require 'templates/document'
