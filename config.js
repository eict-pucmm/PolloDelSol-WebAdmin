const values = {
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
        // set to http://pollo-del-sol.herokuapp.com if deploying to heroku
        url: `http://localhost:5000`
    },
    cloudinary: {
        cloud_name: 'pollo-del-sol',
        api_key: '298841141886296',
        api_secret: 'ZvhqmTdEn5Xbnqlvn-wjagJ11cA'
    },
    firebaseConfig: {
        apiKey: "AIzaSyDC6YS80UfW6inWQA8mYDGp1pZ6Zifbb0U",
        authDomain: "pollo-del-sol.firebaseapp.com",
        databaseURL: "https://pollo-del-sol.firebaseio.com",
        projectId: "pollo-del-sol",
        storageBucket: "pollo-del-sol.appspot.com",
        messagingSenderId: "70619217786",
        appId: "1:70619217786:web:90b2726c80db7213"
     }
}

let loggedIn = false;

module.exports = {values: values, loggedIn: loggedIn};
