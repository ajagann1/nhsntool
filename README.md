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

Example: node main.js --full -x "{filepath1}\Excel.xlsx" --fd "{filepath5}\Description_Full.txt" -l "{filepath6}\Refset_Language.txt"
* Used in the main directory of the repository. Outputs a results.xlsx file directly into the current directory.

## Setting up for global use

npm install -g

## Using globally

Example: nhsntool --full -x "{filepath1}\Excel.xlsx" --fd "{filepath5}\Description_Full.txt" -l "{filepath6}\Refset_Language.txt"
* Outputs a results.xlsx file into the directory the tool is used from. Can be used anywhere.

## Required Flag

* x - Specify the filepath to the Excel file
    * ex: -x {filepath1}\Excel.xlsx

## Semi-Optional Flags (ONE must be used)

* delta - Indicate whether you're using delta documents.  (c and d are required if this flag is used)
	* ex: --delta

* rel - Indicate that you're using the relationship delta document (r is required if this flag is used)
    * ex: --rel

* full - Indicate whether you're using the full description file (fd and l are required if this flag is used)
    * ex: --full

* all - Indicate that you're using all the usable document types (combines the previous 3 flags and has all of their requirements)
    * ex: --all

## Optional Flags

* c - Specify the filepath to the Concept Delta file (only necessary with delta or all flag thrown)
    * ex: -c "{filepath2}\Concept.txt"

* d - Specify the filepath to the Description Delta file (only necessary with delta or all flag thrown)
    * ex: -d "{filepath3}\Description.txt"

* r - Specify the filepath to the Relationship Delta file (only necessary with rel or all flag thrown)
    * ex: -r "{filepath4}\Relationship.txt"

* fd - Specify the filepath to the Full Description file (only necessary with the full or all flag thrown)
    * ex: --fd "{filepath5}\Full_Description.txt"

* l - Specify the filepath to the Refset Language file (only necessary with the full or all flag thrown)
    * ex: -l "{filepath6}\Refset_Language.txt"

* dl - Specify the delimiter used in the documents.  Only supports tab or space right now (t | " ")
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

