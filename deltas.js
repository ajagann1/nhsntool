/**
 * Created by Arvind on 6/16/2016.
 */

var fs = require('fs');
var argv = require('yargs')
  .alias('c', 'cFilePath')
  .demand('c')
  .alias('d', 'dFilePath')
  .demand('d')
  .alias('r', 'rFilePath')
  .demand('r')
  .argv;

var parseFile = function(file){
  var array = new Array();

  var index = file.indexOf("\n");
  while(file.length > 0){
    var cutoff = index !== -1 ? index : file.length;
    var str = file.substring(0, cutoff);
    str = str.replace('\r', '');

    var arr = str.split('\t');
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

var searchDescript = function(conceptCode){
  var str = '';
  var found = false;
  for(var i in descript){
    if(i === '0'){
      continue;
    }
    if(conceptCode === descript[i].delimited[4]){
      if(!found){
        str += 'Description:\n';
        found = true;
      }
      str += descript[i].original + '\n';
    }
  }
  return str;
};

var searchRelation = function(conceptCode){
  var str = '';
  var found = false;
  for(var i in relation){
    if(i === '0'){
      continue;
    }
    if(conceptCode === relation[i].delimited[4] || conceptCode === relation[i].delimited[5]){
      if(!found) {
        str += 'Relationship:\n';
        found = true;
      }
      str += relation[i].original + '\n';
    }
  }
  return str;
};

var concepts = parseFile(fs.readFileSync(argv.cFilePath, 'utf-8'));
var descript = parseFile(fs.readFileSync(argv.dFilePath, 'utf-8'));
var relation = parseFile(fs.readFileSync(argv.rFilePath, 'utf-8'));

var str = '';
var spacer = '--------------------------------------\n';
str += spacer;
for(var i in concepts){
  if(i === '0'){
    continue;
  }
  str = str + 'Concept:\n';
  var conceptCode = concepts[i].delimited[0];
  str += concepts[i].original + '\n\n';
  var searchD = searchDescript(conceptCode);
  if(searchD) str += searchD + '\n\n';
  var searchR = searchRelation(conceptCode);
  if(searchR) str += searchR + '\n\n';
  str += spacer;
}

console.log(str);
