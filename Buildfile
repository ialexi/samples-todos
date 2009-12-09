# ===========================================================================
# Project:   Todos
# ===========================================================================

# Add initial buildfile information here
config :all, :required => :sproutcore

proxy "/task", :to => "localhost:8000"
proxy "/tasks", :to => "localhost:8000"