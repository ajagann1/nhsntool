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
    console.log("Checking indices/delimiter and parsing excel file.");
    var delimiter = argv.dl ? deltas.parseDelimiter(argv.dl) : '\t';

    // var descriptFull = deltas.parseFile(fs.readFileSync(argv.fd, 'utf-8'), delimiter);
    //var concepts = deltas.parseFile(fs.readFileSync(argv.c, 'utf-8'), delimiter);
    //var descript = deltas.parseFile(fs.readFileSync(argv.d, 'utf-8'), delimiter);

    //var relation = deltas.parseFile(fs.readFileSync(argv.r, 'utf-8'), delimiter);

    var indices = deltas.parseIndices(argv.ci, argv.di, argv.ri, argv.xi, argv.li);

    var excel = deltas.excelArray(xlsx.readFile(argv.x), indices.xi);


  } catch (err) {

    console.log(err);
    return;

  }

  /*var excelHeader = '';
  var conceptCodeArray = [];
  
  var excelOut = [[],[],[],[]];*/

  //if(language.length === 0) {
    /*var descriptFullOutput = deltas.generateFullDescript(excel, descriptFull, indices.di);
    descriptFull = [];*/
    /*try {
      language = deltas.parseFile(fs.readFileSync(argv.l, 'utf-8'), delimiter);
    } catch(err){
      console.log(err);
    }
  }*/

  console.log("Beginning output generation.");
  /*for(var i in excel){
    if(i === "0") {
      excelHeader = excel[i];
      excelOut[0].push(['Concept Code'].concat(concepts[0].delimited));
      excelOut[1].push(['Concept Code'].concat(descript[0].delimited));
      excelOut[3].push(['Concept Code'].concat(relation[0].delimited));
      continue;
    }
    if(conceptCodeArray.indexOf(excel[i]) === -1){
      conceptCodeArray.push(excel[i]);*/

      var output = deltas.generateOutput(excel, argv.c, argv.d, argv.l, argv.fd, argv.r, indices, delimiter);
  /*if(output.html && output.str && output.excel){
        
        var count = 0;
        for(var j = 0; j < 4; j++){
          if(j === 2){
            for(var k in descriptFullOutput) {
              if(descriptFullOutput[k][0] === excel[i]) {
                for(var l in descriptFullOutput[k][1].excel) {
                  excelOut[j].push(descriptFullOutput[k][1].excel[l]);
                }
                break;
              }
            }
          } else {
            for (var k in output.excel[count]) {
              excelOut[j].push(output.excel[count][k]);
            }
            count += 1;
          }
        }
      }
    }
  }*/
  

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
        deltas.createExcel(outputLoc, ['Concepts', 'Descriptions', 'All Descriptions', 'Relationships'], output.excel);
      }
    }else{
      deltas.createExcel(outputLoc, ['Concepts', 'Descriptions', 'All Descriptions', 'Relationships'], output.excel);
    }
    console.log('File successfully generated.');
  } catch (err) {
    console.log(err);
  }
  return 0;
};

main();