var request = require('request');
var xmldoc = require('xmldoc');
var express = require("express"),
	app = express(),
	port = process.env.PORT || 3000;
app.engine('html', require('ejs').__express);

var pub = __dirname + '/public',
	view = __dirname + '/views';

var NodeCache = require( "node-cache" );
var myCache = new NodeCache();

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

var stopwords = [];
require('fs').readFile('stopwords.txt', function(err, data) {
    if(err) throw err;
    stopwords = data.toString().split("\n");
    for(i in stopwords) {
        stopwords[i] = "\\b" + stopwords[i] + "\\b";
        stopwords[i] = RegExp(stopwords[i], "gi");
    }
});

function isEmpty(ob) {
   for(var i in ob){ return false;}
  return true;
}

app.get("/display_paths.html", function (req, res) {
    var api_key = "24be2c9e251e33f63b367301a1011dfd";
    var base = req.query.base;
    var lowerCaseBase = base.toLowerCase();
    myCache.get(lowerCaseBase, function(err, val) {
        if(!err && !isEmpty(val)) {
            console.log("cached hit for " + base);
            console.log(val[lowerCaseBase]["results"]);
            res.render('display_paths.html', {
                base: base,
                words: val[lowerCaseBase]["results"]
            });
        } else if(!err && isEmpty(val)) {
            console.log("cache miss for " + base);
            var hostname = "http://www.veryrelated.com/related-api-v1.php";
            var path = hostname + "?api_key=" + api_key + "&base=" + base;
            request(path, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var xml = new xmldoc.XmlDocument(body);
                    var results = xml.childrenNamed("Result");
                    var words = [];
                    for(var i = 0; i < results.length; i++) {
                        var result = results[i].childNamed("Text").val;
                        // remove non-ascii
                        result = result.replace(/([^\x00-\xFF]|\s)*$/g, '');
                        // remove stopwords
                        for(j in stopwords)
                            result = result.replace(stopwords[j], "");
                        // remove double space
                        result = result.replace(/\s+/, " ");
                        if(result.length > 1)
                            words.push(result);
                    }
                    final_words = []
                    for(i in words) {
                        if(i < 5) {
                            final_words.push(words[i]);
                        } else {
                            break;
                        }
                    }
                    myCache.set(lowerCaseBase, {results: final_words})
                    res.render('display_paths.html', {
                        base: base,
                        words: final_words
                    });
                }
            });
        } else {
            console.log("cache error");
        }
    });
});


app.listen(port);
