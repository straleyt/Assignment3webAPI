var express = require('express');
var usergrid = require('usergrid');
var url = require('url');
var app = express();
app.use(express.bodyParser());


var dataClient = new usergrid.client({
orgName : 'tr1alanderr0r',
appName : 'sandbox',
clientId : 'b3U6gzFV-uFQEeWOCWEZ25Ul4A',
clientSecret : 'b3U6ftb0ywUHtr9C0v_Zo5EHcDgPWU4',
authType : usergrid.AUTH_CLIENT_ID,
logging : true,
});

var rootTemplate = {
'movies' : {
'href' : './movies'
}
};

app.get('/', function(req, resp) {
resp.jsonp(rootTemplate);
});


app.get('/get', function(req, res) { 
    var queryString = url.parse(req.url).query;
var options = {
endpoint:"movies", 
qs:{ql:queryString}
};

dataClient.request(options, function (err, data) {
    if (err) {
        res.send('Get Request Failed');
    } else {
        res.jsonp(data);
    }
});

});

app.post('/post', function(req, res) {
if (!req.is('json')) {
res.jsonp(400, {
error : 'Bad request'
});
return;
}

var b = req.body;
var m = {
'Title' : b.Title,
'Year_Released' : b.Year_Released,
'Actors' : b.Actors,
};

if ((m.Title === undefined) || (m.Year_Released === undefined)
|| (m.Actors === undefined)) {
res.jsonp(400, {
error : 'Bad request, undefined'
});
return;
}
createMovie(m, req, res);
});

function createMovie(m, req, res) {
var opts = {
type : 'movies',
name : m.Title
};

dataClient.createEntity(opts, function(err, o) {
if (err) {
res.jsonp(500, err);
return;
}
o.set(m);
o.save(function(err) {
if (err) {
res.jsonp(500, err);
return;
}
res.send(201);
});
});
}

app.delete('/delete', function(req, res) { 
if (!req.is('json')) {
res.jsonp(400, {
error : 'Bad request'
});
return;
} 
var n = req.body;
var properties = {
client:dataClient,
data:{
'type':'movies',
'uuid': n.uuid
}
};
var entity = new usergrid.entity(properties);
entity.destroy(function(err){
    if (err){
        res.send('No movie exists');
return;
    } else {
        entity = null;
res.send('Deleted');
    }
});

});

app.listen(process.env.PORT || 9000);
console.log('The server is running!');
