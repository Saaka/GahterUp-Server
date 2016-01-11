#!/bin/env

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var GatherUp = function () {
    var self = this;

    self.setupVariables = function () {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
        self.dbConnection = process.env.OPENSHIFT_MONGODB_DB_URL || 'localhost:27017';

        if (typeof self.ipaddress === "undefined") {
            self.isDev = true;
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };

    self.terminator = function (sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating GatherUp Server ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };
    self.setupTerminationHandlers = function () {
        //  Process on exit and signals.
        process.on('exit', function () {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function (element, index, array) {
            process.on(element, function () {
                self.terminator(element);
            });
        });
    };

    self.useRoutes = function (app) {
        //TODO REPLACE WITH SINGLE FILES
        app.get('/', function (req, res) {
            self.User.find(function (err, users) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).json(users.length);
                }
            });
        });

        app.post('/testpost', function (req, res) {
            var data = req.body;
            var user = new self.User(data);
            user.save();
            console.log(user);
            res.status(201).json(user);
        });
        
        app.get('/clearUsers', function(req, res) {
           self.User.remove({}, function(err){}); 
            res.status(200);
        });
    };

    //Use later
    self.accessControl = function (req, res, next) {
        if (self.isDev) {
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000');
        } else {
            res.setHeader('Access-Control-Allow-Origin', 'http://saaka.github.io');
        }
        
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        next();
    };

    self.initializeServer = function () {
        self.app = express();
        self.app.use(bodyParser.json());
        self.app.use(bodyParser.urlencoded());
        
        self.app.use(self.accessControl);

        self.useRoutes(self.app);
    };

    self.initDB = function () {
        self.db = mongoose.connect(self.dbConnection);
        self.User = require('./models/userModel');
        console.log('Connected to mongo at address: ' + self.dbConnection);
    };

    self.initialize = function () {
        self.setupVariables();
        self.setupTerminationHandlers();

        self.initializeServer();
        self.initDB();
    };

    self.start = function () {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function () {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now()), self.ipaddress, self.port);
            console.log('isDev: %s', self.isDev);
        });
    };

};

var gu = new GatherUp();
gu.initialize();
gu.start();