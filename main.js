#! /usr/bin/env node

/**
 * Created by Arvind on 6/20/2016.
 */

var argv = require('yargs')
  .describe('delta', 'Indication of whether delta info should be outputted as well')
  .describe('c', 'Concept Delta absolute filepath. Required if delta is set')
  .describe('d', 'Description Delta absolute filepath. Required if delta is set')
  .demand('fd')
  .describe('fd', 'Full Description absolute filepath')
  .demand('l')
  .describe('l', 'Refset Language absolute filepath')
  .describe('r', 'Relationship Delta absolute filepath. Required if delta is set')
  .demand('x')
  .describe('x', 'Custom Excel sheet absolute filepath')
  .describe('dl', 'Delimiter (\\t || " ")')
  .describe('ci', 'Custom indication of which column in the Concept Delta file is the concept code (ex: 4)')
  .describe('di', 'Custom indication of which column in the Description files (full and delta) is the concept code (ex: 4)')
  .describe('ri', 'Custom indication of which columns in the Relationship Delta file are the source and destination concept codes (ex: 4,5)')
  .describe('xi', 'Custom indication of which column in the Excel sheet file is the concept code (ex: AA)')
  .describe('li', 'Custom indication of which column in the Refset Language file is the Description ID and the acceptibility ID (ex: 4,5')
  .describe('t', 'Type of file to output (txt | html | xlsx). xlsx is the default when the t flag isn\'t used')
  .describe('o', 'Specify the output location of the results file with the absolute filepath')
  .describe('fo', 'Force the program to make the filepath specified in o. Does nothing if o isn\t specified')
  .argv;
var fs = require('fs');
var deltas = require('./deltas');
var xlsx = require('xlsx');

var main = function() {
  //Handle all input arguments and parse the input files. Defaulting logic used for the optional flags header and
  //delimiter.
  try {
    
    console.log("Checking indices/delimiter and parsing excel file.");
    var delimiter = argv.dl ? deltas.parseDelimiter(argv.dl) : '\t';
    var indices = deltas.parseIndices(argv.ci, argv.di, argv.ri, argv.xi, argv.li);
    var excel = deltas.excelArray(xlsx.readFile(argv.x), indices.xi);
    
  } catch (err) {
    console.log(err);
    return;

  }

  console.log("Beginning output generation.");
  var output = deltas.generateOutput(excel, argv.delta, argv.c, argv.d, argv.l, argv.fd, argv.r, indices, delimiter);
  
  //Outputs the resulting delta text to a specified file
  try {
    var force = argv.fo ? true : false;
    var outputLoc = argv.o || argv.t ? deltas.parseOutputLoc(argv.o, force, argv.t) : 'results.xlsx';
    if(argv.t){
      if(argv.t === 'html'){
        fs.writeFileSync(outputLoc, output.html);
      }
      else if(argv.t === 'txt'){
        fs.writeFileSync(outputLoc, output.str);
      }
      else if(argv.t === 'xlsx'){
        if(argv.delta) {
          deltas.createExcel(outputLoc, ['Concepts', 'Descriptions', 'Relationships', 'All Descriptions'], output.excel);
        }else{
          var singleExcel = [output.excel[3]];
          deltas.createExcel(outputLoc, ['All Descriptions'], singleExcel)
        }
      }
    }else{
      if(argv.delta) {
        deltas.createExcel(outputLoc, ['Concepts', 'Descriptions', 'Relationships', 'All Descriptions'], output.excel);
      }else{
        singleExcel = [output.excel[3]];
        deltas.createExcel(outputLoc, ['All Descriptions'], singleExcel)
      }
    }
    console.log('File successfully generated.');
  } catch (err) {
    console.log(err);
  }
  return 0;
};

main();