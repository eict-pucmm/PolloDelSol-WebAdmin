values = {
    database: {
        host: 'us-cdbr-iron-east-02.cleardb.net',
        user: 'b0ccbe5cbcfbd1',
        password: '9e38a45c',
        database: 'heroku_7fdb4fe0285393e',
    },
    server: {
        host: '127.0.0.1',
        port: '5000',
        // url to call API
        // set to http://localhost:5000 if working locally
        // set to http://pollo-sel-sol.herokuapp.com if deploying to heroku
        url: `http://localhost:5000`
    },
    cloudinary: {
        cloud_name: 'pollo-del-sol',
        api_key: '298841141886296',
        api_secret: 'ZvhqmTdEn5Xbnqlvn-wjagJ11cA'
    }
}

module.exports = values;
