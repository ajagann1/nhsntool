/**
 * Created by Arvind Jagannathan on 6/16/2016.
 */

var fs = require('fs');
var xlsx = require('xlsx');
var LineReader = require('n-readlines');

exports.checkInputs = function(delta, rel, full, all){
  if(!(delta || rel || full || all)) throw 'The delta, rel, full, or all flag is required to be set';
  if(all && (delta || rel || full)) throw 'The all flag can\'t be set while the delta, rel, or full flag is also set.';
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

//Parse the data in each delta file so that all lines are read as an object with the elements being an array of terms
//and a string that contains the original data of that line.  This object is pushed into an array with there being an
//object for all of the lines in the file.
var parseFile = function (file, delimiter) {
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

var parseLanguage = function(fileLoc, delimiter, li){
  var language = {};
  var parsed = '';
  var lineReader = new LineReader(fileLoc);
  var line;
  var found = false;


  console.log("Parsing language file.");
  while (line = lineReader.next()) {
    parsed = line.toString('utf8').trim().split('\t');
    if(!found){
      if(li.first >= parsed.length || li.second >= parsed.length) throw "Inputted language index out of bounds";
      language['header'] = parsed[li.second];
      found = true;
    }
    language[parsed[li.first]] = parsed[li.second];
  }
  console.log("Finished parsing language file.");
  return language;
};

var parseFullDescript = function(fileLoc, delimit, di, excelCodes){
  var lineReader = new LineReader(fileLoc);
  var line;
  var parsed = [];
  var descript = [];
  var found = false;
  console.log("Parsing full description file.");
  while(line = lineReader.next()){
    parsed = line.toString('utf8').trim().split(delimit);
    if(excelCodes.indexOf(parsed[di]) !== -1){
      descript.push({
        original: line.toString('utf8').trim(),
        delimited: parsed
      });
    } else if(!found){
      descript.push({
        original: line.toString('utf8').trim(),
        delimited: parsed
      });
      found = true;
    }
  }
  console.log('Finished parsing full description file');
  return descript;
};

var generateConceptList = function (excelCodes, concepts, ci){
  var output = {};
  var conceptCodes = [];
  var conceptHeader = '';
  for (var h in excelCodes) {
    var excel = [];
    var str = '';
    var html = '';
    if (conceptCodes.indexOf(excelCodes[h]) === -1) {
      conceptCodes.push(excelCodes[h]);
      for (var i in concepts) {
        if (i === '0') {
          conceptHeader = concepts[i];
          continue;
        }
        if (excelCodes[h] === concepts[i].delimited[ci]) {
          html += '<div data-role="collapsible"><h4>Concepts Delta</h4>';
          html += '<table><tbody><tr>';
          for (var j in conceptHeader.delimited) {
            html += '<th>' + conceptHeader.delimited[j] + '</th>';
          }
          str += "\n\nConcept:\n";
          str += conceptHeader.original + '\n';
          html += '</tr><tr>';
          for (var j in concepts[i].delimited) {
            html += '<td>' + concepts[i].delimited[j] + '</td>';
          }
          str += concepts[i].original + '\n';
          html += '</tr></tbody></table></div>';
          excel = [excelCodes[h]].concat(concepts[i].delimited);
          output[excelCodes[h]] = {
            str: str,
            html: html,
            excel: excel,
            header: conceptHeader
          };
          break;
        }
      }
    }
  }
  return output;
};

//Search the description delta file for the currently looked at concept code.
var generateDescriptList = function (excelCodes, descript, di, delimiter) {
  var descriptHeader = '';
  var excelLine = [];
  var conceptCodes = [];
  var descriptID = '';
  var output = {};
  for(var h in excelCodes) {
    var found = false;
    var excel = [];
    var html = '';
    var str = '';
    if (conceptCodes.indexOf(excelCodes[h]) === -1) {
      conceptCodes.push(excelCodes[h]);
      for (var i in descript) {
        if (i === '0') {
          descriptHeader = descript[i];
          continue;
        }
        if (excelCodes[h] === descript[i].delimited[di]) {
          if (!found) {
            html += '<div data-role="collapsible"><h4>Descriptions Delta</h4>';
            html += '<table><tbody><tr>';
            for (var j in descriptHeader.delimited) {
              html += '<th>' + descriptHeader.delimited[j] + '</th>';
            }
            str += '\nDescription:\n';
            str += descriptHeader.original + '\n';
            html += '</tr>';
            found = true;
          }
          descriptID = descript[i].delimited[0];
          html += '<tr>';
          for (var j in descript[i].delimited) {
            html += '<td>' + descript[i].delimited[j] + '</td>';
          }
          str += descript[i].original;
          excelLine = [excelCodes[h]].concat(descript[i].delimited);
          str += '\n';
          html += '</tr>';
          excel.push(excelLine);
        }
      }
      if (found) {
        html += '</tbody></table></div>';
        output[excelCodes[h]] = {
          str: str,
          html: html,
          excel: excel,
          header: descriptHeader,
        };
      }
    }
  }
  return output;
};

//Search the description delta file for the currently looked at concept code.
var generateFullDescriptList = function (excelCodes, fullDescript, language, di, delimiter) {
  var descriptHeader = '';
  var conceptCodes = [];
  var excelLine = [];
  var descriptID = '';
  var output = {};
  for(var h in excelCodes) {
    var html = '';
    var str = '';
    var excel = [];
    var found = false;
    if (conceptCodes.indexOf(excelCodes[h]) === -1) {
      conceptCodes.push(excelCodes[h]);
      descriptHeader = fullDescript[0];
      for (var i in fullDescript) {
        if (excelCodes[h] === fullDescript[i].delimited[di]) {
          if (!found) {
            html += '<div data-role="collapsible"><h4>Descriptions Delta</h4>';
            html += '<table><tbody><tr>';
            for (var j in descriptHeader.delimited) {
              html += '<th>' + descriptHeader.delimited[j] + 'acceptabilityId</th>';
            }
            str += '\nAll Descriptions:\n';
            str += descriptHeader.original + delimiter + 'acceptabilityId' + '\n';
            html += '</tr>';
            found = true;
          }
          descriptID = fullDescript[i].delimited[0];
          html += '<tr>';
          for (var j in fullDescript[i].delimited) {
            html += '<td>' + fullDescript[i].delimited[j] + '</td>';
          }
          html += '<td>' + language[descriptID] + '</td>';
          str += fullDescript[i].original + delimiter + language[descriptID] + '\n';
          excelLine = [excelCodes[h]].concat(fullDescript[i].delimited).concat(language[descriptID]);
          html += '</tr>';
          excel.push(excelLine);
        }
      }
      if (found) {
        html += '</tbody></table></div>';
        output[excelCodes[h]] = {
          str: str,
          html: html,
          excel: excel,
          header: descriptHeader
        };
      }
    }
  }
  return output;
};

//Search the relationshp delta file for the currently looked at concept code.
var generateRelationList = function (excelCodes, relation, ri) {
  var conceptCodes = [];
  var relationHeader = '';
  var output = {};
  for (var h in excelCodes) {
    var html = '';
    var str = '';
    var excel = [];
    var found = false;
    if (conceptCodes.indexOf(excelCodes[h]) === -1) {
      conceptCodes.push(excelCodes[h]);
      for (var i in relation) {
        if (i === '0') {
          relationHeader = relation[i];
          continue;
        }
        if (excelCodes[h] === relation[i].delimited[ri.first] || excelCodes[h] === relation[i].delimited[ri.second]) {
          if (!found) {
            html += '<div data-role="collapsible"><h4>Relationships Delta</h4>';
            html += '<table><tbody><tr>';
            for (var j in relationHeader.delimited) {
              html += '<th>' + relationHeader.delimited[j] + '</th>';
            }
            str += "\nRelationship:\n";
            str += relationHeader.original + '\n';
            html += '</tr>';
            found = true;
          }
          html += '<tr>';
          for (var j in relation[i].delimited) {
            html += '<td>' + relation[i].delimited[j] + '</td>';
          }
          str += relation[i].original + '\n';
          html += '</tr>';
          excel.push([excelCodes[h]].concat(relation[i].delimited));
        }
      }
      if (found) {
        html += '</tbody></table></div>';
        output[excelCodes[h]] = {
          str: str,
          html: html,
          excel: excel,
          header: relationHeader
        };
      }
    }
  }
  return output;
};

exports.generateOutput = function (excelCodes, delta, rel, full, all, conceptLoc, descriptLoc, languageLoc, 
                                   fullDescriptLoc, relationLoc, indices, delimiter) {
  var html =
    '<html>' +
    '<head>' +
    '<style>' +
    'table, th, td {' +
    'border: 1px solid black;' +
    'border-collapse: collapse;' +
    '}' +
    'table {' +
    'width: 100%;' +
    '}' +
    '</style>' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css">' +
    '<script src="http://code.jquery.com/jquery-1.11.3.min.js"></script>' +
    '<script src="http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>' +
    '</head>' +
    '<body>' +
    '<div data-role="page" id="pageone">' +
    '<div data-role="header">' +
    '<h1>Results</h1>' +
    '</div>' +
    '<div data-role="main" class="ui-content">';
  var str = '';
  var spacer = '--------------------------------------';
  str += spacer;
  var excel = [[], [], [], []];

  if(delta && (!conceptLoc || !descriptLoc)){
    throw 'If delta is flagged, the locations of the concept and description delta files must be included';
  }
  
  if(rel && (!relationLoc)){
    throw 'If rel is flagged, the location of the relationship delta file must be included';
  }
  
  if(full && (!fullDescriptLoc || !languageLoc)){
    throw 'If full is flagged, the location of the full description file and the language file must be included';
  }
  
  if(all && (!conceptLoc || !descriptLoc || !relationLoc || !fullDescriptLoc || !languageLoc)){
    throw 'If all is flagged, the locations of the concept, description, and relationship delta files and the full ' +
    'description and language files must be included';
  }
  
  if(delta || all) {
    var concepts = parseFile(fs.readFileSync(conceptLoc, 'utf-8'), delimiter);
    if (indices.ci >= concepts[0].delimited.length) throw "Inputted concept index out of bounds";
    var conceptObj = generateConceptList(excelCodes, concepts, indices.ci);
    excel[0].push(['Concept Code'].concat(concepts[0].delimited));
    concepts = null;
  }

  if(delta || all) {
    var descript = parseFile(fs.readFileSync(descriptLoc, 'utf-8'), delimiter);
    if (indices.di >= descript[0].delimited.length) throw "Inputted description index out of bounds";
    var descriptObj = generateDescriptList(excelCodes, descript, indices.di, delimiter);
    excel[1].push(['Concept Code'].concat(descript[0].delimited));
    descript = null;
  }

  if(rel || all) {
    var relation = parseFile(fs.readFileSync(relationLoc, 'utf-8'), delimiter);
    if (indices.ri.first >= relation[0].delimited.length || indices.ri.second >= relation[0].delimited.length) throw "Inputted relationship index out of bounds";
    var relationObj = generateRelationList(excelCodes, relation, indices.ri);
    excel[2].push(['Concept Code'].concat(relation[0].delimited));
    relation = null;
  }

  if(full || all) {
    //Making the assumption that the full description file has the same format as the delta file, always.
    var language = parseLanguage(languageLoc, delimiter, indices.li);
    var fullDescript = parseFullDescript(fullDescriptLoc, delimiter, indices.di, excelCodes);
    var fullDescriptObj = generateFullDescriptList(excelCodes, fullDescript, language, indices.di, delimiter);
    excel[3].push(['Concept Code'].concat(fullDescript[0].delimited).concat(language['header']));
    fullDescript = null;
    language = null;
  }
  
  var conceptCodes = [];
  for(var i in excelCodes){
    var obj = {};
    if(i === '0') continue;
    if(conceptCodes.indexOf(excelCodes[i]) === -1) {
      conceptCodes.push(excelCodes[i]);
      if(conceptObj || descriptObj || relationObj || fullDescriptObj) {
        html += '<div data-role="collapsible"><h4>' + excelCodes[i] + '</h4>';
        str += "\n\nConcept Code: " + excelCodes[i];

        if (conceptObj && conceptObj.hasOwnProperty(excelCodes[i])) {
          obj = conceptObj[excelCodes[i]];
          html += obj.html;
          str += obj.str;
          excel[0].push(obj.excel);
        }

        if (descriptObj && descriptObj.hasOwnProperty(excelCodes[i])) {
          obj = descriptObj[excelCodes[i]];
          html += obj.html;
          if ((conceptObj && !conceptObj.hasOwnProperty(excelCodes[i])) || !conceptObj) str += '\n';
          str += obj.str;
          for (var j in obj.excel) {
            excel[1].push(obj.excel[j]);
          }
        }
        if (relationObj && relationObj.hasOwnProperty(excelCodes[i])) {
          obj = relationObj[excelCodes[i]];
          html += obj.html;
          if (((descriptObj && descriptObj.hasOwnProperty(excelCodes[i])) || !descriptObj)
            && ((conceptObj && conceptObj.hasOwnProperty(excelCodes[i])) || !conceptObj)) str += '\n';
          str += obj.str;
          for (var j in obj.excel) {
            excel[2].push(obj.excel[j]);
          }
        }
        if (fullDescriptObj && fullDescriptObj.hasOwnProperty(excelCodes[i])) {
          obj = fullDescriptObj[excelCodes[i]];
          html += obj.html;
          if (((descriptObj && descriptObj.hasOwnProperty(excelCodes[i])) || !descriptObj)
            && ((conceptObj && conceptObj.hasOwnProperty(excelCodes[i])) || !conceptObj)
            && ((relationObj && relationObj.hasOwnProperty(excelCodes[i])) || !relationObj)) str += '\n';
          str += obj.str;
          for (var j in obj.excel) {
            excel[3].push(obj.excel[j]);
          }
        }
        html += '</div>';
        str += '\n' + spacer;
      }
    }
  }

  html += '</div></body></html>';

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

exports.parseIndices = function (ci, di, ri, xi, li){
  //Generic test cases
  if(ci && ci - 1 < 0) throw "Inputted concept index is not a valid index";
  if(di && di - 1 < 0) throw "Inputted description index is not a valid index";
  if(ri && (ri.match(/,/g) && ri.match(/,/g).length > 1)) throw "Incorrect input for relationship index. Not " +
  "splitting indices by comma or too many indices inputted.";
  if(ri){
    var riInd = ri.split(',');
    if(riInd[0] - 1 < 0) throw "Inputted first relationship index is not a valid index";
    if(riInd[1] - 1 < 0) throw "Inputted second relationship index is not a valid index";
  }
  if(xi && (xi.match(/\d+/g))) throw "Inputted excel index of column isn't a possible index.";
  if(li && (li.indexOf(',') === -1 || (li.match(/,/g) && li.match(/,/g).length > 1))) throw "Incorrect input for language index. Not " +
  "splitting indices by comma or too many indices inputted.";
  if(li){
    var liInd = li.split(',');
    if(liInd[0] - 1 < 0) throw "Inputted first relationship index is not a valid index";
    if(liInd[1] - 1 < 0) throw "Inputted second relationship index is not a valid index";
  }
  
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
    li: li ? {
      first: liInd[0] - 1,
      second: liInd[1] - 1
    } : {
      first: 5,
      second: 6
    }
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

