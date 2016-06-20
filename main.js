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
  .alias('h', 'header')
  .alias('l', 'delimiter')
  .alias('o', 'outputLoc')
  .argv;
var fs = require('fs');
var deltas = require('./deltas');

var main = function() {
  //Handle all input arguments and parse the input files. Defaulting logic used for the optional flags header and
  //delimiter.
  try {
    var header = argv.header ? deltas.parseHeader(argv.header) : true;

    var delimiter = argv.delimiter ? deltas.parseDelimiter(argv.delimiter) : '\t';

    //Made this happen synchronously so that we populate these variables immediately
    var concepts = deltas.parseFile(fs.readFileSync(argv.cFilePath, 'utf-8'), delimiter);
    var descript = deltas.parseFile(fs.readFileSync(argv.dFilePath, 'utf-8'), delimiter);
    var relation = deltas.parseFile(fs.readFileSync(argv.rFilePath, 'utf-8'), delimiter);
  } catch (err) {
    console.log(err);
    return;
  }

  var conceptHeader = '';
  var str = '';
  var spacer = '--------------------------------------';
  str += spacer;
  for (var i in concepts) {
    //If the user indicates there's no header, parse the first line, else, don't.
    if (header && i === '0') {
      conceptHeader = concepts[i].original;
      continue;
    }

    str += '\n\nConcept:\n';
    str += conceptHeader + '\n';
    str += concepts[i].original;

    //Generates the output text using some conditionals for new line formatting.
    var conceptCode = concepts[i].delimited[0];
    str += deltas.generateOutput(conceptCode, descript, relation, header);

    str += '\n' + spacer;
  }

  //Outputs the resulting delta text to a specified file
  try {
    var force = argv.fo ? true : false;
    var outputLoc = argv.outputLoc ? deltas.parseOutputLoc(argv.outputLoc, force) : 'results.txt';
    fs.writeFileSync(outputLoc, str);
    console.log('File successfully generated.');
  } catch (err) {
    console.log(err);
  }
  return 0;
};

main();