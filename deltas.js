/**
 * Created by Arvind Jagannathan on 6/16/2016.
 */

var fs = require('fs');

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
  for (var i in concepts) {
    //If the user indicates there's no header, parse the first line, else, don't.
    if (i === '0') {
      var conceptHeader = concepts[i].delimited;
      continue;
    }
    if(conceptCode === concepts[i].delimited[ci]) {
      html += '<div data-role="collapsible"><h4>Concepts Delta</h4>';
      html += '<table><tbody><tr>';
      for(var j in conceptHeader) {
         html += '<th>' + conceptHeader[j] + '</th>';
      }
      html += '</tr><tr>';
      for(var j in concepts[i].delimited){
        html += '<td>' + concepts[i].delimited[j] + '</td>';
      }
      html += '</tr></tbody></table></div>';
      break;
    }
  }
  return html;
};

//Search the description delta file for the currently looked at concept code.
var searchDescript = function (conceptCode, descript, di) {
  var html = '';
  var found = false;
  var descriptHeader = '';
  for (var i in descript) {
    if (i === '0') {
      descriptHeader = descript[i].delimited;
      continue;
    }
    if (conceptCode === descript[i].delimited[di]) {
      if (!found) {
        html += '<div data-role="collapsible"><h4>Descriptions Delta</h4>';
        html += '<table><tbody><tr>';
        for(var j in descriptHeader) {
          html += '<th>' + descriptHeader[j] + '</th>';
        }
        html += '</tr>';
        found = true;
      }
      html += '<tr>';
      for(var j in descript[i].delimited) {
        html += '<td>' + descript[i].delimited[j] + '</td>';
      }
      html += '</tr>';
    }
  }
  if(found) html += '</tbody></table></div>';
  return html;
};

//Search the relationshp delta file for the currently looked at concept code.
var searchRelation = function (conceptCode, relation, ri) {
  var html = '';
  var found = false;
  var relationHeader = '';
  for (var i in relation) {
    if (i === '0') {
      relationHeader = relation[i].delimited;
      continue;
    }
    if (conceptCode === relation[i].delimited[ri.first] || conceptCode === relation[i].delimited[ri.second]) {
      if (!found) {
        html += '<div data-role="collapsible"><h4>Relationships Delta</h4>';
        html += '<table><tbody><tr>';
        for(var j in relationHeader) {
          html += '<th>' + relationHeader[j] + '</th>';
        }
        html += '</tr>';
        found = true;
      }
      html += '<tr>';
      for(var j in relation[i].delimited) {
        html += '<td>' + relation[i].delimited[j] + '</td>';
      }
      html += '</tr>';
    }
  }
  if(found) html += '</tbody></table></div>';
  return html;
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

exports.generateOutput = function (conceptCode, concepts, descript, relation, indices) {
  var html = '';

  var searchC = searchConcept(conceptCode, concepts, indices.ci);
  if(searchC) html += searchC;

  var searchD = searchDescript(conceptCode, descript, indices.di);
  if (searchD) html += searchD;

  var searchR = searchRelation(conceptCode, relation, indices.ri);
  if (searchR) html += searchR;
  
  return html;
};

exports.parseOutputLoc = function (outputLoc, force) {
  var filepath;
  try {
    if(outputLoc.indexOf('.') === -1) outputLoc += '.html';
    if(outputLoc.substring(outputLoc.lastIndexOf('.'), outputLoc.length) !== '.html')
      outputLoc.replace(outputLoc.substring(outputLoc.lastIndexOf('.'), outputLoc.length), '.html');

    if (outputLoc.indexOf('/') !== -1) filepath = outputLoc.substring(0, outputLoc.lastIndexOf('/'));
    else if (outputLoc.indexOf('\\') !== -1) filepath = outputLoc.substring(0, outputLoc.lastIndexOf('\\'));
    else throw "Incorrect path";

    var stats = fs.statSync(filepath);
  } catch (err) {
    if (force) {
      console.log("Creating a path for file to go to.")
      fs.mkdirSync(filepath);
    }else if(err.message === "Incorrect path"){
      throw "Incorrect path"
    } else {
      throw "File path " + filepath + " does not exist.";
    }
  }
  return outputLoc;
};

exports.parseIndices = function (concepts, descript, relation, ci, di, ri, xi){
  //Generic test cases
  if(ci && (ci - 1 > concepts[0].delimited.length - 1 || ci - 1 < 0)) throw "Concept index is not a valid index";
  if(di && (di - 1 > descript[0].delimited.length - 1 || di - 1 < 0)) throw "Description index is not a valid index";
  if(ri && (ri.indexOf(',') === -1 || ri.match(/,/g).length > 1)) throw "Incorrect input for relationship index. Not " +
  "splitting indices by comma or too many indices inputted.";
  if(ri){
    var riInd = ri.split(',');
    if(riInd[0] - 1 > relation[0].delimited.length - 1 || riInd[0] - 1 < 0) throw "First relationship index is not a valid index";
    if(riInd[1] - 1 > relation[0].delimited.length - 1 || riInd[1] - 1 < 0) throw "Second relationship index is not a valid index";
  }
  if(xi && (xi.match(/\d+/g).length > 0)) throw "Inputted excel index of column isn't a possible index.";
  
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
    xi: xi ? xi.toUpperCase() : "AA"
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

