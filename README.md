
First time:

    Postgres:

        sudo apt-get update
        sudo apt-get install postgresql postgresql-contrib

    Node:

        curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash

        # Restart console

        nvm install 5.5.0 # Install node version 5.5.0
        nvm alias default 5.5.0 # Set 5.5.0 as default node version (optional)
        npm install -g bower # Install bower globally
        npm install -g gulp # Install gulp globally
        npm install -g sequelize-cli # Install sequelize globally
        npm install -g pm2

Update:

    npm install # Install backend dependencies
    bower install # Install frontend dependencies
    gulp stylus # Compile stylus
    sequelize db:seed:all
    sequelize db:migrate # Run migrations
    npm install pm2
    vi .bashrc  (add at the end export NODE_ENV=production)

Seeds:
      An admin user will be created:
      email: mike@yacom.com
      password: yacomadmin (You may change it from the users page)
    sequelize db:seed:all

Start server:

    npm start # Default port: 8080
