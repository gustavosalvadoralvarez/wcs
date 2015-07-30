
var utils = {}; 

function hasProperty(o, p){
	return !!o[p]
}
function duckType(o){

	if (hasProperty(o, 'callee')){
		return 'arguments'
	}
	if (hasProperty(o, 'toLowerCase')){
		return 'string'
	}
	if (hasProperty(o, 'slice')){
		return 'array'
	}
	if (hasProperty(o, 'toExponential')){
		return 'number'
	}
	return 'object'
}

utils.duckType = duckType;

function asArray(thing){
	switch(duckType(thing)){
		case 'array':
			return thing
		case 'arguments':
			return Array.prototype.slice.call(thing);
		default:
			return [thing]
	}
}

utils.asArray = asArray; 

function invoke(methodKey, methodArgs){
	var args = asArray(arguments), 
		methodKey = args[0], 
		methodArgs = args.slice(1);
	return function invocation(obj){
		return obj[methodKey](methodArgs)
	}
}

utils.invoke = invoke;

function getKeyFrom(k){
	return function (o){
		return o[k]
	}
}

utils.getKeyFrom = getKeyFrom;

function getValueFrom(o){
	return function (k){
		return o[k]
	}
}

utils.getValueFrom = getValueFrom;

function returnTo(val){
	return function(args){
		return val
	}
}

utils.returnTo = returnTo; 

function partial(fnRef, pArgs){ 
	var pArgs = Array.prototype.slice.call(arguments, 1);
	return function callWith(rArgs){
		return fnRef.call(
			null, 
			pArgs.concat(Array.prototype.slice.call(rArgs))
		)
	}
}

utils.partial = partial;

function featurize(arr){
	var uniqs, ints;
	uniqs = unique(arr).concat("NA");
	if (!(uniqs.length < arr.length)){
		return{
			values: arr
		}
	}
	ints = arr.map(
		function(v){
			if(!v){
				return "NA"
			}
			return v.toString()
		}
		).map(
			function(v){
				return uniqs.indexOf(v)
			}
		); 
	// console.log({
	// 	levels: uniqs,
	// 	integers: ints
	// });
	return {
		levels: uniqs,
		integers: ints
	}
}

utils.featurize = featurize; 

function defeaturize(obj){
	if (obj.values){
		return obj.values
	}
	return obj.integers.map(Number).map(getValueFrom(obj.levels))
}

utils.defeaturize = defeaturize;

function rightPartial(fnRef, pArgs){ 
	var pArgs = Array.prototype.slice.call(arguments, 1);
	return function callWith(rArgs){
		return fnRef.call(
			null, 
			Array.prototype.slice.call(rArgs).concat(pArgs)
		)
	}
}

 


function range(ops, args){
	var to, from, by;

	if(typeof(ops) === 'string' || typeof(ops) === 'number'){
		to = Number(ops) - 1, 
		from = arguments[1]
			? Number(arguments[1]) 
			: 0, 
		by = arguments[2]
			? Number(arguments[2]) 
			:  1;
	} else {
		to = Number(ops.to) - 1, 
		from = Number(ops.from) || 0, 
		by = Number(ops.by) || 1;
	}

	return Array.apply(null, Array(1 + ((to - from) / by))).map(
		function (v, i) { 
				return from + (i * by) 
		}
	)
}

utils.range = range;

function repeat(val, times){
	return range(times+1).map(returnTo(val))
}

utils.repeat = repeat;


function binaryFilter(binaryArr){
	return function (v, i){
		return binaryArr[i]
	}
}

utils.binaryFilter = binaryFilter; 


function booleanMap(booleanArr){
	return function(arr){
		return arr.reduce(
			function(rarr, v, i){
				if (booleanArr[i]){
					rarr = rarr.concat(v);
				}
				return rarr
			},
			[]
		)
	}
}

utils.booleanMap = booleanMap; 


function labeledChild(obj, label){
	var labelKey, labelVal, child; 
	labelKey = label || 'label'; 
	labelVal = Object.keys(obj)[0]; 
	child = obj[labelVal]; 
	child[labelKey] = labelVal; 
	return child
}

utils.labeledChild = labeledChild;

function numericObject(arr){
	return arr.reduce(
		function(o, v, i){
			o[i] = v;
			return 0
		},
		{}
	)
}


function keyCopy(obj, typ){
	typ = typ || String;
	return Object.keys(obj).reduce(function(o, k){ o[k] = typ(); return o }, {})
}

function stripInstanceMethods(o){
	return Object.keys(o).reduce(
		function (r, k){
			var v;
			v = o[k];
			if (!(v instanceof Function)){
				r[k] = v; 
			}
			return r
		},
		{}
	)
}

function propertyKeys(o){
	return Object.keys(o).reduce(
		function(ks, k){
			if (!o[k].call){
				ks = ks.concat(k)
			}
			return ks
		},
		[]
	)
}

function loadInstanceMethods(fns){
	var fnKeys;
	fnKeys = Object.keys(fns);
	return function (inst){
		fnKeys.forEach(
			function (k){
				inst[k] = fns[k];
			}
		);
		return inst
	}
}

function checkEquals(v){
	if(Array.isArray(v)){
		var inV = v.indexOf;
		return function (cv){
			return cv in v
		}
	}
	return 	function (cv){
		return cv === v
	}
}

function keySubset(o, ks){

	return ks.reduce(
		function(r, k){
			r[k] = o[k];
			return r
		}, 
		{}
	)
}

utils.keySubset = keySubset;

function keyMap(ks){
	return function(o){
		return keySubset(o, ks);
	}
}

utils.keyMap = keyMap;


function dCopy(o){
	return JSON.parse(JSON.stringify(o))
}

utils.deepCopy = dCopy; 

function inMemStorage(){
	var store;
	store = {};
	return {
		setItem: function(k, v){
			store[k] = JSON.stringify(v);
			return v
		},
		getItem: function(k){
			return k in store
					? store[k]
					: null;
		}
	}
}

utils.inMemStorage = inMemStorage;

function seqApply(fnF, fnS){
	var fnArr, fnF;
	fnArr = asArray(fns).slice(1); 
	return function(args){
		return fnArr.reduce(
			function(v, fn){
				return fn(v);
			},
			fnF(args)
		)
	}
}

utils.seqApply = seqApply;


function transpose(mx){
	var m, n;
	m = range(mx.length);
	n = range(mx[0].length);
	return n.map(
		function (i){ 
		    return m.map(
			    function(j){
			        return mx[j][i]
			    }
		  	)
		}
    )
}

utils.transpose = transpose; 

// function rowFilter(v, vi){
// 	if(vi){
// 		return function (row){
// 			return row[vi] === v
// 		}
// 	} else {
// 		return function (row){
// 			return row.indexOf(v) !== -1
// 		}
// 	}
// }

// utils.rowFilter = rowFilter; 

// function DataFrame(valuesArr, headers){
// 	var df, columns, values;
// 	df = {};
// 	if (headers){
// 		switch(Array.isArray(headers)){ 
// 			case true: 
// 				columns = headers;
// 				values = valuesArr;
// 			break;
// 			default: 
// 				columns = valuesArr[0]; 
// 				values = valuesArr.slice(1, valuesArr.length); 	
// 		} 
// 	} else {
// 		columns = range(valuesArr.length).map(
// 			function (v){
// 				return "X."+String(v);
// 			}
// 		); 
// 		values = valuesArr;
// 	}
// 	df.columns = columns; 
// 	df.values = values;
// 	df.dims = [values.length, columns.length]; 
// 	df.prototype._colIndex = function colIndex(v){ 
// 		return this.columns.indexOf(v) 
// 	}
// 	df.prototype._rows = function _rows(v, vi, vals){
// 		vals = vals || this.values; 
// 		return vals.filter(rowFilter(v, vi));
// 	}

// 	df.prototype._cols = function(cols, vals){
// 		vals = vals || this.values; 
// 		return vals.filter(colFIlter(cols, this._colIndex))
// 	}

// 	df.prototype.view = function (viewexp){
// 		var exps, rexp, cexp, view;
// 		exps = viewexp.split(',');
// 		rexp = exps[0];
// 		cexp = exps[1] || null; 
// 		view = 
// 	}

// 	function rowFilter(v, vi){
// 		if(vi){
// 			return function (row){
// 				return row[vi] === v
// 			}
// 		} else {
// 			return function (row){
// 				return row.indexOf(v) !== -1
// 			}
// 		}
// 	}

// 	function colFilter(cols, ixFn){
// 		var colIxs, colKs;
// 		colKs = cols.map(
// 			function (c){
// 				return parseInt(c, 10) || colIndex(c)
// 			}
// 		);
// 		if (!(cols[0] instanceof Number){
// 			colIxs = cols.map(ixFn);
// 		}
// 		return function ( vArr){
// 			return vArr.filter(v, i){
// 				colIxs.indexOf(i) !== -1
// 			}
// 		}
// 	}

// 	function getCol(col){
// 		var colIx;
// 		colIx = col instanceof Number 
// 				? col
// 				: colIndex(col); 
			
// 	}
// 	function parseView


// }

// function dataFrame(csvString, ops, dataFrameView){
// 	var self, columns;
// 	ops = ops || {};
// 	function extract(csvString){
// 		var csvLines, headers, ncol, nrow;
// 		csvLines = csvString.split("\n").map(invoke("split", ","));
// 		ncol = csvLines[0].length;
// 		nrow = csvLines.length;
// 		if(!ops.noHeaders){
// 			var hre = /[" ']/g; 
// 			headers = csvLines[0].map(function(s){ return s.replace(/[" ']/g, '')});
// 			console.log(headers);
// 			csvLines = csvLines.slice(1, ncol);
// 		} else {
// 			headers = range(ncol).map(String).map(function(v){ return "X."+v });
// 		}
// 		return headers.reduce(
// 			function(r, col, i){
// 				r[col] = csvLines.map(getFrom(i));
// 				return r
// 			},
// 			{}
// 		);
// 	} 
// 	function getRows(d, s, e, cs){
// 		return (cs || Object.keys(d)).reduce(
// 			function (r, cl, i){
// 				r[cl] = d[cl].slice(e, s);
// 				return r
// 			},
// 			{}
// 		)
// 	}
// 	function filterRowsBy(d, cc, cfn, cs){ 
// 		cs = cs || Object.keys(d);
// 		return d[cc].reduce(
// 			function (r, v, i){
// 				if (cfn(v)){
// 					cs.forEach(
// 						function(c){
// 							r[c] = r[c].concat(d[c][i]);
// 						}
// 					);
// 				}
// 				return r
// 			},
// 			keyCopy(d, Array)
// 		)
// 	}
	
// 	self = dataFrameView || extract(csvString);
// 	self.columns = columns = Object.keys(self);
// 	self.nrow = self[columns[0]].length;
// 	self.ncol = self.columns.length;
// 	self.data = function(){ return keySubset(this, this.columns) }
// 	self.values = function(){ return transpose(this.data()) } 
// 	self.where = function (exps){
// 		// :: String, String || String
// 		//
// 		// if String, String, the first is interpreted as a 
// 		// a conditional expressions for selecting across objects (rows)
// 		// and can take the form column = String || JSON.stringify(Array)
// 		// values in the columns is === the String or in case of Array is contained therein
// 		// or the form Num : Num, in which case the range starting at the first Num and ending at the 
// 		// second is returned.
// 		// The second argument is interpreted as a column name or stringifyed array of column names
// 		// if String, it is interpreted as a column argument
// 		var args, view, viewCols, rowExp, colExp, isJSONArray;
// 		args = asArray(arguments);
// 		console.log(args.length);
// 		rowExp = args.length > 1 ? args[0] : null; 
// 		colExp = rowExp ? args[1] : args[0]; 
// 		isJSONArray = /(\[([\w]+,?)+\])/;
// 		view = this.data();
// 		if (typeof(colExp) === 'string'){
// 			if (isJSONArray.test(colExp)){
// 				viewCols = JSON.parse(colExp);
// 			} else{ 
// 				viewCols = [colExp]
// 			}
// 		} else if (Array.isArray(colExp)) {
// 			viewCols = colExp;
// 		} else {
// 			viewCols = this.columns;
// 		}
// 		if (rowExp){
// 			if (rowExp.indexOf("=") > 0){
// 				var expParts, col, val; 
// 				expParts = rowExp.split('='); 
// 				col = expParts[0];
// 				val = expParts[1];
// 				if (isJSONArray.test(val)){
// 					view = filterRowsBy(view, col, checkEquals(JSON.parse(val)), viewCols);
// 				}else{
// 					view = filterRowsBy(view, col, checkEquals(val), viewCols);
// 				}
// 			} else if(rowExp.indexOf(":") > 0){
// 				var expRows; 
// 				expRows = rowExp.split(':');
// 				view = getRows(view, Number(expRows[1]), Number(expRows[2]), viewCols);
// 			}
// 		}else{
// 			view = keySubset(view, viewCols);
// 		}
		
// 		return dataFrame(null, ops, view); 
// 	}

// 	self.values = 

// 	return self 
// }

// utils.dataFrame = dataFrame;


function unique(arr){
	return Object.keys(arr.reduce(function findUunique(tmpObj, item){
		if (!(item in tmpObj)){ 
			tmpObj[item] = '';
		}
		return tmpObj
	}, {}))
}

utils.unique = unique; 


function closest(selector, el) {
    function testContainer(el){
    	return el.parentNode.querySelectorAll(selector)
    }
    var matches;
    for ( ; el && el !== document; elem = elem.parentNode ) {
    	matches = testContainer(el); 
    	if (matches.length > 0){ 
    		return matches
    	}
    }

    return false;

}

utils.closest = closest; 

function deepCopy(item){
	return JSON.parse(JSON.stringify(item));
}

utils.deepCopy = deepCopy;


function unSelect(menuEl){
	menuEl.selectedIndex = -1;
}

utils.unSelect = unSelect;


function jsonImport(importLink){
	return JSON.parse(importLink.import.querySelector('BODY').textContent)
}

function safeParse(o){
	try{
		return JSON.parse(o)
	} catch (e){
		return o
	}
}

function isJSONArray (str) { 
	return /(\[([\w]+,?)+\])/.test(str)
};

utils.JSON = {
	'import': jsonImport,
	'isArray': isJSONArray
};

// function testServer(name, testFiles, port){
// 	var flRoutes; 
// 	flRoutes = Object.keys(testFiles); 
// 	require('http').createServer(
// 		function (req, res){
// 			var routeFl, reqURL;
// 			routeFl = flRoutes.filter(function(k){ return treq.indexOf(k) !== -1 })[0];
// 			reqURL = req.url; 
// 			if (routeFl){
// 				res.statusCode = 200; 
// 				require('fs').createReadStream(routeFl).pipe(res); 
// 			} else {
// 				res.statusCode = 404;
// 				res.end("Wtf Willis?");
// 			}
			
// 		}
// 	)
// }


if (typeof module !== 'undefined' && module.exports){
	var k; 
	for(k in utils){
		module.exports[k] = utils[k];
	}
}
