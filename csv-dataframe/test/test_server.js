var http = require('http'); 
var fs = require('fs'); 

console.log("Initializing testing server..."); 
http.createServer(
	function (req, res){
		res.writeHead(200, { "Content-Type": "text/csv" });
		fs.createReadStream('./Clientes.csv').pipe(res); 
	}
).listen(7357, 
	function(err){
		if (err){
			console.log(err);
			return
		}
		console.log("csv-dataframe testing server listening on: 7357"); 
	} 
);