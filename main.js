#! /usr/bin/env node

/**
 * Created by Arvind on 6/20/2016.
 * -c "C:\myRepo\SNOMED text files\Concept.txt" -d "C:\myRepo\SNOMED text files\Description.txt" -r "C:\myRepo\SNOMED text files\Relationship.txt"
 */

var argv = require('yargs')
  .describe('delta', 'Indication that delta info should be outputted [delta, rel, full, or all flag is required to be set]')
  .describe('rel', 'Indication that relationship info should be outputted [delta, rel, full, or all flag is required to be set]')
  .describe('full', 'Indication that full description info should be outputted [delta, rel, full, or all flag is required to be set]')
  .describe('all', 'Indication that all info should be outputted (the concept, description, and relationship delta files and the full description file)' +
    '[delta, rel, full, or all flag is required to be set]. If all is set, delta, rel, and full should not be set.')
  .describe('c', 'Concept Delta absolute filepath. Required if delta is set')
  .describe('d', 'Description Delta absolute filepath. Required if delta is set')
  .describe('fd', 'Full Description absolute filepath. Required if full is set')
  .describe('l', 'Refset Language absolute filepath. Required if full is set')
  .describe('r', 'Relationship Delta absolute filepath. Required if rel is set')
  .demand('x')
  .describe('x', 'Custom Excel sheet absolute filepath. Always required')
  .describe('dl', 'Delimiter (t || " ")')
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
    deltas.checkInputs(argv.delta, argv.rel, argv.full, argv.all);
    var delimiter = argv.dl ? deltas.parseDelimiter(argv.dl) : '\t';
    var indices = deltas.parseIndices(argv.ci, argv.di, argv.ri, argv.xi, argv.li);
    var excel = deltas.excelArray(xlsx.readFile(argv.x), indices.xi);
    
  } catch (err) {
    console.log(err);
    return;

  }

  console.log("Beginning output generation.");
  var output = deltas.generateOutput(excel, argv.delta, argv.rel, argv.full, argv.all, argv.c, argv.d, argv.l, argv.fd, argv.r, indices, delimiter);
  
  //Outputs the resulting delta text to a specified file
  try {
    var force = argv.fo ? true : false;
    var outputLoc = argv.o || argv.t ? deltas.parseOutputLoc(argv.o, force, argv.t) : 'results.xlsx';
    var sheetNames = [];
    var finalExcel = [];
    if(argv.t){
      if(argv.t === 'html'){
        fs.writeFileSync(outputLoc, output.html);
      }
      else if(argv.t === 'txt'){
        fs.writeFileSync(outputLoc, output.str);
      }
      else if(argv.t === 'xlsx'){
        if(argv.delta) {
          finalExcel.push(output.excel[0]);
          sheetNames.push('Concepts');
          finalExcel.push(output.excel[1]);
          sheetNames.push('Descriptions');
        }
        if(argv.rel){
          finalExcel.push(output.excel[2]);
          sheetNames.push('Relationships');
        }
        if(argv.full){
          finalExcel.push(output.excel[3]);
          sheetNames.push('All Descriptions');
        }
        if(argv.all){
          finalExcel.push(output.excel[0]);
          sheetNames.push('Concepts');
          finalExcel.push(output.excel[1]);
          sheetNames.push('Descriptions');
          finalExcel.push(output.excel[2]);
          sheetNames.push('Relationships');
          finalExcel.push(output.excel[3]);
          sheetNames.push('All Descriptions');
        }
        deltas.createExcel(outputLoc, sheetNames, finalExcel);
      }
    }else{
      if(argv.delta) {
        finalExcel.push(output.excel[0]);
        sheetNames.push('Concepts');
        finalExcel.push(output.excel[1]);
        sheetNames.push('Descriptions');
      }
      if(argv.rel){
        finalExcel.push(output.excel[2]);
        sheetNames.push('Relationships');
      }
      if(argv.full){
        finalExcel.push(output.excel[3]);
        sheetNames.push('All Descriptions');
      }
      if(argv.all){
        finalExcel.push(output.excel[0]);
        sheetNames.push('Concepts');
        finalExcel.push(output.excel[1]);
        sheetNames.push('Descriptions');
        finalExcel.push(output.excel[2]);
        sheetNames.push('Relationships');
        finalExcel.push(output.excel[3]);
        sheetNames.push('All Descriptions');
      }
      deltas.createExcel(outputLoc, sheetNames, finalExcel);
    }
    console.log('File successfully generated.');
  } catch (err) {
    console.log(err);
  }
  return 0;
};

main();