# Dependencies

* Nodejs v0.12.7

# Installation

## Start with:

npm install

## This should install the modules:

* Mocha
* requirejs
* yargs

# Use

## Default use

node main.js -c "{filepath1}/deltaConcepts.txt" -d "{filepath2}/deltaDescriptions.txt" -r "{filepath3}/deltaRelationships.txt"
* Outputs a results.txt file into the main directory of the repository


## Optional Flags

* h - indicate if the delta files do not have a header depicting what each column represents with y/n (case does not matter)
	* ex: -h n

* i - specify the indices where concept codes are found in each document. If h is set (y), this is required.  This should be 4 integer numbers seperated by only commas.
	* ex: -i "1,2,3,4"
	
* l - indicate what's being used for spacing in the delta files (currently only supports ' ' for space and t for tab)
	* ex: -l ' '

* o - specify an output path for the results.txt file
	* ex: -o "{filepath}/results.txt"

* fo - force the scripts to create the folder specified in o if the path doesn't currently exist. Used in conjunction with -o.
	* ex: --fo
	
