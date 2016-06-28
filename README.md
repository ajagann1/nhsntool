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
* n-readlines
* gruntjs

# Use

## Default use

node main.js -c "{filepath1}\Concept.txt" -d "{filepath2}\Description.txt" -r "{filepath3}\Relationship.txt" -x "{filepath4}\Excel.xlsx" --fd "{filepath5}\Description_Full.txt" -l "{filepath6}\Refset_Language.txt"
* Outputs a results.xlsx file into the main directory of the repository

## Setting up for global use

npm install -g

## Using globally

nhsntool -x "{filepath4}\Excel.xlsx" --fd "{filepath5}\Description_Full.txt" -l "{filepath6}\Refset_Language.txt"
* Outputs a results.xlsx file into the directory the tool is used from


## Optional Flags

* delta - Indicate whether you're using delta documents.  (c, d, and r are required if this flag is used)
	* ex: --delta

* c - Specify the filepath to the Concept Delta file (only necessary with delta flag thrown)
    * ex: -c "{filepath1}\Concept.txt"

* d - Specify the filepath to the Description Delta file (only necessary with delta flag thrown)
    * ex: -d "{filepath2}\Description.txt"

* r - Specify the filepath to the Relationship Delta file (only necessary with delta flag thrown)
    * ex: -r "{filepath3}\Relationship.txt"

* dl - Specify the delimiter used in the documents (\t || " ")
	* ex: --dl t

* ci - Specify the column where concept codes are found in the Concepts Delta document.
	* ex: --ci 1

* di - Specify the column where concept codes are found in the Descriptions Delta document.
	* ex: --di 5

* ri - Specify the columns where concept codes are found in the Relationships Delta document.
	* ex: --ri 5,6

* xi - Specify the column where concept codes are found in the excel spreadsheet.
	* ex: --xi AA

* li - Specify the columns in the Refset Language file where the Description ID and the acceptability ID are kept
	* ex: --li 4,5

* t - Specify the type of output wanted from the tool (txt | html | xlsx). xlsx is the default
	* ex: -t txt

* o - Specify an output path for the results.html file
	* ex: -o "{filepath}/results.html"

* fo - Force the scripts to create the folder specified in o if the path doesn't currently exist. Used in conjunction with -o.
	* ex: --fo

