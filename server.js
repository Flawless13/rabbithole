var express = require("express"),
	app = express(),
	port = process.env.PORT || 3000;

var pub = __dirname + '/public',
	view = __dirname + '/views';

app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use("/public", express.static(pub));
	app.use(express.static(view));
	app.use(express.errorHandler());
});

app.get("/views", function(req, res) {
 	res.render('index.html');
});

app.get("/display_paths/:base", function (req, res) {
    var api_key = "24be2c9e251e33f63b367301a1011dfd";
    var base = req.param("base");
    var options = {
        hostname: "http://www.veryrelated.com/related-api-v1.php",
        path: "key=" + api_key + "&base=" + base
    };

    var gsaReq = http.get(options, function (response) {
        var completeResponse = '';
        response.on('data', function (chunk) {
            completeResponse += chunk;
        });
        response.on('end', function() {
            res.locals.base = base;
            res.render('display_paths.html')
        })
    }).on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

});

app.listen(port);
