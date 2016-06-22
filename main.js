#! /usr/bin/env node

/**
 * Created by Arvind on 6/20/2016.
 */

var argv = require('yargs')
  .alias('c', 'cFilePath')
  .demand('c')
  .alias('d', 'dFilePath')
  .demand('d')
  .alias('r', 'rFilePath')
  .demand('r')
  .alias('l', 'delimiter')
  .alias('o', 'outputLoc')
  .argv;
var fs = require('fs');
var deltas = require('./deltas');
var xlsx = require('xlsx');

var main = function() {
  //Handle all input arguments and parse the input files. Defaulting logic used for the optional flags header and
  //delimiter.
  try {
    var delimiter = argv.delimiter ? deltas.parseDelimiter(argv.delimiter) : '\t';

    //Made this happen synchronously so that we populate these variables immediately
    console.log("Parsing files.");

    var indices = deltas.parseIndices(concepts, descript, relation, argv.ci, argv.di, argv.ri, argv.xi);
    
    var file = xlsx.readFile(argv.x);
    var excel = deltas.excelArray(file, indices.xi);
    var concepts = deltas.parseFile(fs.readFileSync(argv.cFilePath, 'utf-8'), delimiter);
    var descript = deltas.parseFile(fs.readFileSync(argv.dFilePath, 'utf-8'), delimiter);
    var relation = deltas.parseFile(fs.readFileSync(argv.rFilePath, 'utf-8'), delimiter);

  } catch (err) {

    console.log(err);
    return;

  }

  var conceptHeader = '';
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
  console.log("Generating output.");
  for(var i in excel){
    if(i === "0") {
      excelHeader = excel[i];
      continue;
    }
    if(conceptCodeArray.indexOf(excel[i]) === -1){
      conceptCodeArray.push(excel[i]);
      var output = deltas.generateOutput(excel[i], concepts, descript, relation, indices);
      if(output){
        html += '<div data-role="collapsible"><h4>' + excel[i] + '</h4>' + output + '</div>';
      }
    }
  }
  html += '</div></body></html>';

  //Outputs the resulting delta text to a specified file
  try {
    var force = argv.fo ? true : false;
    var outputLoc = argv.outputLoc ? deltas.parseOutputLoc(argv.outputLoc, force) : 'results.html';

    fs.writeFileSync(outputLoc, html);
    console.log('File successfully generated.');
  } catch (err) {
    console.log(err);
  }
  return 0;
};

main();