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

//Search the description delta file for the currently looked at concept code.
exports.searchDescript = function (conceptCode, descript, header) {
  var str = '';
  var found = false;
  var descriptHeader = '';
  for (var i in descript) {
    if (header && i === '0') {
      descriptHeader = descript[i].original + '\n';
      continue;
    }
    if (conceptCode === descript[i].delimited[4]) {
      if (!found) {
        str += 'Description:\n';
        str += descriptHeader;
        found = true;
      }
      str += descript[i].original + '\n';
    }
  }
  return str;
};

//Search the relationshp delta file for the currently looked at concept code.
exports.searchRelation = function (conceptCode, relation, header) {
  var str = '';
  var found = false;
  var relationHeader = '';
  for (var i in relation) {
    if (header && i === '0') {
      relationHeader = relation[i].original + '\n';
      continue;
    }
    if (conceptCode === relation[i].delimited[4] || conceptCode === relation[i].delimited[5]) {
      if (!found) {
        str += 'Relationship:\n';
        str += relationHeader;
        found = true;
      }
      str += relation[i].original + '\n';
    }
  }
  return str;
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

//Determine if the input for the header flag is usable. Throw an error if it isn't.
exports.parseHeader = function (header) {
  if (header.toLowerCase() === 'y') {
    return true;
  } else if (header.toLowerCase() === 'n') {
    return false;
  } else {
    throw 'Header input must be y or n';
  }
};

exports.generateOutput = function (conceptCode, descript, relation, header) {

  var str = '';

  var searchD = exports.searchDescript(conceptCode, descript, header);
  if (searchD) str += '\n\n' + searchD;
  else str += '\n';

  var searchR = exports.searchRelation(conceptCode, relation, header);
  if (searchR) str += '\n' + searchR;

  return str;
};

exports.parseOutputLoc = function (outputLoc, force) {
  try {
    var filepath;
    if (outputLoc.indexOf('/') !== -1) filepath = outputLoc.substring(0, outputLoc.lastIndexOf('/'));
    else if (outputLoc.indexOf('\\') !== -1) filepath = outputLoc.substring(0, outputLoc.lastIndexOf('\\'));
    var stats = fs.statSync(filepath);
  } catch (err) {
    if (force) {
      console.log("Creating a path for file to go to.")
      fs.mkdirSync(filepath);
    } else {
      throw "File path " + filepath + " does not exist.";
    }
  }
  return outputLoc;
};