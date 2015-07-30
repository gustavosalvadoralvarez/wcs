
var utils = {}; 


function asArray(thing, flattenKey){
	return Array.prototype.slice.call(thing)
}

utils.asArray = asArray; 


function repeat(str, times){

	return Array.apply(null, Array(times)).map(function(){return str}).join('')
}

utils.repeat = repeat;


function invoke(methodKey, methodArgs){
	var args = asArray(arguments), 
		methodKey = args[0], 
		methodArgs = args.slice(1);
	return function invocation(obj){
		return obj[methodKey](methodArgs)
	}
}

utils.invoke = invoke; 


function partial(fnRef, pArgs){ 
	var pArgs = Array.prototype.slice.call(arguments, 1);
	return function callWith(rArgs){
		return fnRef.call(null, 
						  pArgs.concat(Array.prototype.slice.call(rArgs)))
	}
}

utils.partial = partial;


function range(ops, args){
	var to, from, by;

	if(typeof(ops) === 'string' || typeof(ops) === 'number'){
		to = Number(ops), 
		from = arguments[1]
			? Number(arguments[1]) 
			: 0, 
		by = arguments[2]
			? Number(arguments[2]) 
			:  1;
	} else {
		to = Number(ops.to), 
		from = Number(ops.from) || 0, 
		by = Number(ops.by) || 1;
	}

	return Array.apply(null, Array(1 + ((to - from) / by))).map(
		function rangeVal(v, i) { 
				return from + (i * by) 
		}
	)
}

utils.range = range;


function labeledChild(obj, label){
	var labelKey, labelVal, child; 
	console.log(obj);
	labelKey = label || 'label'; 
	labelVal = Object.keys(obj)[0]; 
	console.log(Object.keys(obj));
	child = obj[labelVal]; 
	child[labelKey] = labelVal; 
	return child
}

utils.labeledChild = labeledChild;


function csvParser(csvString, headers){
	var lines = csvString.split('\n')
		firstLine = lines[0].split(','),
		csvKeys = headers !== false
				? firstLine
				: range(1, firstLine.length).map(function(i){ return 'X' + i }),
		dataLines = headers !== false
					? lines.slice(1)
					: lines,
		emptyLine = repeat(',', firstLine.length -1);
			
	return dataLines
			.filter(function checkEmpty(line){
				return line.indexOf(emptyLine) === -1
			})
			.map(invoke('split', [',']))
			.map(function toObj(line){
				return csvKeys.reduce(
					function addKey(obj, k, i){
						obj[k] = line[i];
						return obj
					}, 
				{})
			})
}

utils.csvParser = csvParser; 


function unique(arr){
	return Object.keys(arr.map(JSON.stringify).reduce(function findUunique(tmpObj, item){
		if (!(item in tmpObj)){ 
			tmpObj[item] = '';
		}
		return tmpObj
	}, {})).map(JSON.parse)
}

utils.unique = unique; 


function csvCol(csvList, colName){
	return csvList.map(
		function gather(line){
			return line[colName]
		}
	)
}

utils.csvCol = csvCol; 


function csvGroupBy(csv, groupColName){ 
	var groupedObj = {}; 
	groupedObj[groupColName] = unique(csvCol(csv, groupColName)).reduce(
		function groupRows(grouped, group){
			grouped[group] = csv.filter(
				function groupMember(row){ 
					return row[groupColName] === group 
				}
			).map(
				function partialCopy(obj){
					var copyObj = {}, k;
					for (k in obj){
						if (k !== groupColName) {
							copyObj[k] = obj[k];
						}
					}
					return copyObj
				}
			); 
			return grouped
		}, {}) 
	return groupedObj
}

utils.csvGroupBy = csvGroupBy; 


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
	console.log(importLink);
	console.log(importLink.import);
	return JSON.parse(importLink.import.querySelector('BODY').textContent)
}

utils.JSON = {
	'import': jsonImport
}


if (typeof module !== 'undefined' && module.exports){
	var k; 
	for(k in utils){
		module.exports[k] = utils[k];
	}
}
