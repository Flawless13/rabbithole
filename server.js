var request = require('request')
    xmldoc = require('xmldoc')
    express = require("express"),
	app = express(),
	port = process.env.PORT || 3000;
    NodeCache = require("node-cache");
    myCache = new NodeCache();
app.engine('html', require('ejs').__express);

var pub = __dirname + '/public',
	view = __dirname + '/views';

app.configure(function(){
    app.use(express.cookieParser());
    app.use(express.session({secret: 'FD3JF8560PIY'}));
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

app.get("/(index.html)?", function(req, res) {
    req.session.visited = req.session.visited || [];
    req.session.started = req.session.started || new Date();
    res.render("index.html");
});

app.get("/about.html", function(req, res) {
    res.render("about.html", {title: "About Us"});
});

var stopwords = [];
var fileReader = require('fs')

fileReader.readFile('stopwords.txt', function(err, data) {
    if(err) throw err;
    stopwords = data.toString().split("\n");
    for(i in stopwords) {
        stopwords[i] = "\\b" + stopwords[i] + "\\b";
        stopwords[i] = RegExp(stopwords[i], "gi");
    }
});

var randWords = [];
fileReader.readFile('words.txt', function(err, data) {
    if(err) throw err;
    randWords = data.toString().split("\n");
});

function getRandWord() {
    return randWords[Math.floor(Math.random() * randWords.length)];
}

function isEmpty(ob) {
    for(var i in ob) {
        return false;
    }
    return true;
}

app.get("/history.html", function(req, res) {
    res.render('history.html', {
        history: req.session.visited || [],
        started: req.session.started || (new Date()).toString()
    });
});

app.get("/random.html", function(req, res) {
    var base = getRandWord();
    res.render("pretty.html", {base: base});
});

app.get("/pretty.html", function(req, res) {
    res.render('pretty.html', {
        base: req.query.base
    });
});

app.get("/get_5_words.html", function(req, res) {
    var base = req.query.base;
    var visited = req.session.visited;
    if(visited) {
        if(visited[visited.length - 1] != base)
            req.session.visited.push(base);
    } else {
        req.session.visited = [base];
    }
    var api_key = "24be2c9e251e33f63b367301a1011dfd";
    var lowerCaseBase = base.toLowerCase();
    myCache.get(lowerCaseBase, function(err, val) {
        if(!err && !isEmpty(val)) {
            res.json({name: base, children: val[lowerCaseBase]["results"]});
        } else if(!err && isEmpty(val)) {
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
                        result = result.replace(/\d+/, " ");
                        if(result.length > 1)
                            words.push(result);
                    }
                    final_words = []
                    for(i in words) {
                        if(true) {
                            final_words.push({name: words[i]});
                        } else {
                            break;
                        }
                    }
                    myCache.set(lowerCaseBase, {results: final_words})
                    res.json({name: base, children: final_words});
                }
            });
        } else {
            console.log("cache error");
        }
    });

})


app.get("/display_paths.html", function (req, res) {
    var base = req.query.base;
    res.render("pretty.html", {base: base});
});

app.listen(port);
