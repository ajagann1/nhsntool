#! /usr/bin/env node

/**
 * Created by Arvind on 6/20/2016.
 */

var argv = require('yargs')
  .demand('c')
  .demand('d')
  .demand('fd')
  .demand('l')
  .demand('r')
  .demand('x')
  .argv;
var fs = require('fs');
var deltas = require('./deltas');
var xlsx = require('xlsx');

var main = function() {
  //Handle all input arguments and parse the input files. Defaulting logic used for the optional flags header and
  //delimiter.
  try {
    var delimiter = argv.dl ? deltas.parseDelimiter(argv.l) : '\t';

    //Made this happen synchronously so that we populate these variables immediately
    console.log("Parsing files.");



    var excel = deltas.excelArray(xlsx.readFile(argv.x), indices.xi);
    var concepts = deltas.parseFile(fs.readFileSync(argv.c, 'utf-8'), delimiter);
    var descript = deltas.parseFile(fs.readFileSync(argv.d, 'utf-8'), delimiter);
    var descriptFull = deltas.parseFile(fs.readFileSync(argv.fd, 'utf-8'), delimiter);
    var language = deltas.parseFile(fs.readFileSync(argv.l, 'utf-8'), delimiter);
    var relation = deltas.parseFile(fs.readFileSync(argv.r, 'utf-8'), delimiter);

    var indices = deltas.parseIndices(concepts, descript, relation, language, argv.ci, argv.di, argv.ri, argv.xi, argv.li);

  } catch (err) {

    console.log(err);
    return;

  }

  var excelHeader = '';
  var conceptCodeArray = [];
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
  var excelOut = [[],[],[]];
  console.log("Generating output.");
  for(var i in excel){
    if(i === "0") {
      excelHeader = excel[i];
      excelOut[0].push(['Concept Code'].concat(concepts[0].delimited));
      excelOut[1].push(['Concept Code'].concat(descript[0].delimited));
      excelOut[2].push(['Concept Code'].concat(descriptFull[0].delimited));
      excelOut[3].push(['Concept Code'].concat(relation[0].delimited));
      continue;
    }
    if(conceptCodeArray.indexOf(excel[i]) === -1){
      conceptCodeArray.push(excel[i]);
      var output = deltas.generateOutput(excel[i], concepts, descript, relation, language, indices);
      if(output.html && output.str && output.excel){
        html += '<div data-role="collapsible"><h4>' + excel[i] + '</h4>' + output.html + '</div>';
        str += "\n\nConcept Code: " + excel[i] + output.str + '\n' + spacer;
        for(var j in output.excel){
          for(var k in output.excel[j]){
            excelOut[j].push(output.excel[j][k]);
          }
        }
      }
    }
  }
  html += '</div></body></html>';

  //Outputs the resulting delta text to a specified file
  try {
    var use = '';
    var force = argv.fo ? true : false;
    var outputLoc = argv.o || argv.t ? deltas.parseOutputLoc(argv.o, force, argv.t) : 'results.xlsx';
    if(argv.t){
      if(argv.t === 'html') use = html;
      else if(argv.t === 'txt') use = str;
      else if(argv.t === 'xlsx') use = excelOut;
    }else use = excelOut;
    if(use === excelOut) deltas.createExcel(outputLoc, ['Concepts', 'Descriptions', 'Relationships'], excelOut);
    else fs.writeFileSync(outputLoc, use);
    console.log('File successfully generated.');
  } catch (err) {
    console.log(err);
  }
  return 0;
};

main();