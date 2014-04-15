var request = require('request');
var xmldoc = require('xmldoc');
var express = require("express"),
	app = express(),
	port = process.env.PORT || 3000;
app.engine('html', require('ejs').__express);

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

app.get("/display_paths.html", function (req, res) {
    var api_key = "24be2c9e251e33f63b367301a1011dfd";
    var base = req.query.base;
    var hostname = "http://www.veryrelated.com/related-api-v1.php";
    var path = hostname + "?api_key=" + api_key + "&base=" + base;
    request(path, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var xml = new xmldoc.XmlDocument(body);
            var results = xml.childrenNamed("Result");
            var first = results[0].childNamed("Text").val;
            var second = results[1].childNamed("Text").val;
            var third = results[2].childNamed("Text").val;
            res.render('display_paths.html', {
                base: base,
                first: first,
                second: second,
                third: third
            });
        }
    });
});


app.listen(port);
