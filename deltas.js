/**
 * Created by Arvind Jagannathan on 6/16/2016.
 */

var fs = require('fs');
var xlsx = require('xlsx');

//Parse the data in each delta file so that all lines are read as an object with the elements being an array of terms
//and a string that contains the original data of that line.  This object is pushed into an array with there being an
//object for all of the lines in the file.
exports.parseFile = function (file, delimiter) {
  var array = [];

  var index = file.indexOf("\n");
  while (file.length > 0) {
    var cutoff = index !== -1 ? index : file.length;
    var str = file.substring(0, cutoff);
    str = str.replace('\r', '');

    if (str.indexOf(delimiter) != -1) {
      var arr = str.split(delimiter);
    } else {
      throw "Chosen delimiter (\'" + delimiter + "\') does not work for this file."
    }
    var obj = {
      delimited: arr,
      original: str
    };
    array.push(obj);


    file = file.substring(cutoff + 1);
    index = file.indexOf("\n");
  }
  return array;
};

var searchConcept = function (conceptCode, concepts, ci){
  var html = '';
  var str = '';
  var excel = [];
  for (var i in concepts) {
    //If the user indicates there's no header, parse the first line, else, don't.
    if (i === '0') {
      var conceptHeader = concepts[i];
      continue;
    }
    if(conceptCode === concepts[i].delimited[ci]) {
      html += '<div data-role="collapsible"><h4>Concepts Delta</h4>';
      html += '<table><tbody><tr>';
      for(var j in conceptHeader.delimited) {
        html += '<th>' + conceptHeader.delimited[j] + '</th>';
      }
      str += "\n\nConcept:\n";
      str += conceptHeader.original + '\n';
      html += '</tr><tr>';
      for(var j in concepts[i].delimited){
        html += '<td>' + concepts[i].delimited[j] + '</td>';
      }
      str += concepts[i].original + '\n';
      html += '</tr></tbody></table></div>';
      excel.push([conceptCode].concat(concepts[i].delimited));
      break;
    }
  }
  return {
    str: str,
    html: html,
    excel: excel
  };
};

//Search the description delta file for the currently looked at concept code.
var searchDescript = function (conceptCode, descript, di) {
  var html = '';
  var str = '';
  var found = false;
  var descriptHeader = '';
  var excel = [];
  for (var i in descript) {
    if (i === '0') {
      descriptHeader = descript[i];
      continue;
    }
    if (conceptCode === descript[i].delimited[di]) {
      if (!found) {
        html += '<div data-role="collapsible"><h4>Descriptions Delta</h4>';
        html += '<table><tbody><tr>';
        for(var j in descriptHeader.delimited) {
          html += '<th>' + descriptHeader.delimited[j] + '</th>';
        }
        str += '\nDescription:\n';
        str += descriptHeader.original + '\n';
        html += '</tr>';
        found = true;
      }
      html += '<tr>';
      for(var j in descript[i].delimited) {
        html += '<td>' + descript[i].delimited[j] + '</td>';
      }
      str += descript[i].original + '\n';
      html += '</tr>';
      excel.push([conceptCode].concat(descript[i].delimited));
    }
  }
  if(found){
    html += '</tbody></table></div>';
  } 
  return{
    str: str,
    html: html,
    excel: excel
  };
};

//Search the relationshp delta file for the currently looked at concept code.
var searchRelation = function (conceptCode, relation, ri) {
  var html = '';
  var str = '';
  var found = false;
  var relationHeader = '';
  var excel = [];
  for (var i in relation) {
    if (i === '0') {
      relationHeader = relation[i];
      continue;
    }
    if (conceptCode === relation[i].delimited[ri.first] || conceptCode === relation[i].delimited[ri.second]) {
      if (!found) {
        html += '<div data-role="collapsible"><h4>Relationships Delta</h4>';
        html += '<table><tbody><tr>';
        for(var j in relationHeader.delimited) {
          html += '<th>' + relationHeader.delimited[j] + '</th>';
        }
        str += "\nRelationship:\n";
        str += relationHeader.original + '\n';
        html += '</tr>';
        found = true;
      }
      html += '<tr>';
      for(var j in relation[i].delimited) {
        html += '<td>' + relation[i].delimited[j] + '</td>';
      }
      str += relation[i].original + '\n';
      html += '</tr>';
      excel.push([conceptCode].concat(relation[i].delimited));
    }
  }
  if(found) {
    html += '</tbody></table></div>';
  }
  return {
    str: str,
    html: html,
    excel: excel
  };
};

//Determine if the input for the delimiter flag is usable. Throw an error if it isn't.
exports.parseDelimiter = function (delimit) {
  if (delimit === ' ') {
    return delimit;
  } else if (delimit === 't') {
    return '\t';
  }
  else throw 'Unsupported delimiter choice ' + delimit + '.';
};

exports.generateOutput = function (conceptCode, concepts, descript, relation, language, indices) {
  var html = '';
  var str = '';
  var excel = [[], [], []];

  var searchC = searchConcept(conceptCode, concepts, indices.ci);
  if (searchC.str && searchC.html) {
    html += searchC.html;
    str += searchC.str;
    excel[0] = searchC.excel;
    /*for(var i in searchC.excel){
      excel[0].push(searchC.excel[i]);
    }*/
  }

  var searchD = searchDescript(conceptCode, descript, language, indices.di, indices.li);
  if (searchD.str && searchD.html) {
    html += searchD.html;
    if(!searchC.str) str += '\n';
    str += searchD.str;
    excel[1] = searchD.excel;
    /*for(var i in searchD.excel){
      excel[1].push(searchD.excel[i]);
    }*/
  }

  var searchR = searchRelation(conceptCode, relation, indices.ri);
  if (searchR.str && searchR.html) {
    html += searchR.html;
    if(!searchD.str) str += '\n';
    str += searchR.str;
    excel[2] = searchR.excel;
    /*for(var i in searchR.excel){
      excel[2].push(searchR.excel[i]);
    }*/
  }

  return {
    str: str,
    html: html,
    excel: excel
  };
};

exports.parseOutputLoc = function (outputLoc, force, outputType) {
  var filepath;
  var ext = '';
  if(outputType){
    if(outputType === 'txt') ext = 'txt';
    else if(outputType === 'html') ext = 'html';
    else if(outputType === 'xlsx') ext = 'xlsx';
    else throw 'Unsupported extension type.';
  } else {
    ext = 'xlsx';
  }
  if(outputLoc) {
    try {
      if (outputLoc.indexOf('.') === -1) outputLoc += '.' + ext;
      if (outputLoc.substring(outputLoc.lastIndexOf('.'), outputLoc.length) !== '.' + ext)
        outputLoc.replace(outputLoc.substring(outputLoc.lastIndexOf('.'), outputLoc.length), '.' + ext);

      if (outputLoc.indexOf('/') !== -1) filepath = outputLoc.substring(0, outputLoc.lastIndexOf('/'));
      else if (outputLoc.indexOf('\\') !== -1) filepath = outputLoc.substring(0, outputLoc.lastIndexOf('\\'));
      else throw "Incorrect path";

      var stats = fs.statSync(filepath);
    } catch (err) {
      if (force) {
        console.log("Creating a path for file to go to.");
        fs.mkdirSync(filepath);
      } else if (err.message === "Incorrect path") {
        throw "Incorrect path";
      } else {
        throw "File path " + filepath + " does not exist.";
      }
    }
  }else{
    if(outputType) outputLoc = 'results.' + ext;
    else outputLoc = 'results.xlsx';
  }
  return outputLoc;
};

exports.parseIndices = function (concepts, descript, relation, ci, di, ri, xi, li){
  //Generic test cases
  if(ci && (ci - 1 > concepts[0].delimited.length - 1 || ci - 1 < 0)) throw "Inputted concept index is not a valid index";
  if(di && (di - 1 > descript[0].delimited.length - 1 || di - 1 < 0)) throw "Inputted description index is not a valid index";
  if(ri && (ri.indexOf(',') === -1 || ri.match(/,/g).length > 1)) throw "Incorrect input for relationship index. Not " +
  "splitting indices by comma or too many indices inputted.";
  if(ri){
    var riInd = ri.split(',');
    if(riInd[0] - 1 > relation[0].delimited.length - 1 || riInd[0] - 1 < 0) throw "Inputted first relationship index is not a valid index";
    if(riInd[1] - 1 > relation[0].delimited.length - 1 || riInd[1] - 1 < 0) throw "Inputted second relationship index is not a valid index";
  }
  if(xi && (xi.match(/\d+/g).length > 0)) throw "Inputted excel index of column isn't a possible index.";
  if(li && (li - 1 > language[0].delimited.length - 1 || li - 1 < 0)) throw "Inputted language index is not a valid index";
  
  return {
    ci: ci ? ci - 1 : 0,
    di: di ? di - 1 : 4,
    ri: ri ? {
      first: riInd[0] - 1,
      second: riInd[1] - 1
    } : {
      first: 4,
      second: 5
    },
    xi: xi ? xi.toUpperCase() : "AA",
    li: li ? li - 1 : 6
  };
};

exports.excelArray = function(workbook, col) {

  var excelConvert = function(sheet, col){
    var array = [];
    for(var i in sheet){
      if(i.indexOf(col) !== -1 && !i.replace(col, '').match(/[A-Z]/g)){
        array.push(sheet[i].v.toString());
      }
    }
    if(!array) throw "Inputted excel index is invalid.";
    return array;
  };

  var result = [];
  result = excelConvert(workbook.Sheets[workbook.SheetNames[0]], col);

  return result;
};

function Workbook() {
  if(!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

//Taken shamelessly from term-query
function sheet_from_array_of_arrays(data, opts) {
  var ws = {};
  var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
  for(var R = 0; R != data.length; ++R) {
    for(var C = 0; C != data[R].length; ++C) {
      if(range.s.r > R) range.s.r = R;
      if(range.s.c > C) range.s.c = C;
      if(range.e.r < R) range.e.r = R;
      if(range.e.c < C) range.e.c = C;
      var cell = {v: data[R][C] };
      if(cell.v == null) continue;
      var cell_ref = xlsx.utils.encode_cell({c:C,r:R});

      if(typeof cell.v === 'number') cell.t = 'n';
      else if(typeof cell.v === 'boolean') cell.t = 'b';
      else if(cell.v instanceof Date) {
        cell.t = 'n'; cell.z = xlsx.SSF._table[14];
        cell.v = datenum(cell.v);
      }
      else cell.t = 's';

      ws[cell_ref] = cell;
    }
  }
  if(range.s.c < 10000000) ws['!ref'] = xlsx.utils.encode_range(range);
  return ws;
}

//Taken shamelessly from term-query
exports.createExcel = function (fileName, sheetNames, data) {
  var wb = new Workbook();

  /* add worksheet to workbook */
  for(var i in sheetNames){
    var sheetName = sheetNames[i];
    wb.SheetNames.push(sheetName);
    wb.Sheets[sheetName] = sheet_from_array_of_arrays(data[i]);
  }

  xlsx.writeFile(wb, fileName);
};

