# Dependencies

* Nodejs v0.12.7 https://nodejs.org/en/blog/release/v0.12.7/ (Select the downloader appropriate for your operating system)

# Installation

## Start with:

npm install

## This should install the modules:

* Mocha
* requirejs
* yargs
* xlsx

# Use

## Default use

node main.js -c "{filepath1}/deltaConcepts.txt" -d "{filepath2}/deltaDescriptions.txt" -r "{filepath3}/deltaRelationships.txt" -x "{filepath4}/excel.xlsx"
* Outputs a results.html file into the main directory of the repository

## Setting up for global use

npm install -g

## Using globally

nhsntool -c "{filepath1}/deltaConcepts.txt" -d "{filepath2}/deltaDescriptions.txt" -r "{filepath3}/deltaRelationships.txt" -x "{filepath4}/excel.xlsx"
* Outputs a results.html file into the directory the tool is used from


## Optional Flags

* ci - specify the column where concept codes are found in the concepts delta document.
	* ex: --ci 1

* di - specify the column where concept codes are found in the descriptions delta document.
	* ex: --di 5

* ri - specify the column where concept codes are found in the relationships delta document.
	* ex: --ri 5,6

* xi - specify the column where concept codes are found in the excel spreadsheet.
	* ex: --xi AA

* l - indicate what's being used for spacing in the delta files (currently only supports ' ' for space and t for tab)
	* ex: -l ' '

* o - specify an output path for the results.html file
	* ex: -o "{filepath}/results.html"

* fo - force the scripts to create the folder specified in o if the path doesn't currently exist. Used in conjunction with -o.
	* ex: --fo
	
