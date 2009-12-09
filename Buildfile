# ===========================================================================
# Project:   Todos
# ===========================================================================

# Add initial buildfile information here
config :all, :required => [:sproutcore, :pomona]

proxy "/task", :to => "localhost:8000"
proxy "/tasks", :to => "localhost:8000"
proxy "/comet/", :to => "localhost:8008", :url=>"/"