// Copyright 2015, Mateen Ulhaq <mulhaq2005@gmail.com>
// Licensed under CC-By-Attr 3.0

// 1. Open Google Chrome
// 2. Navigate to canvas page where files are located
// 3. Open the console by pressing Ctrl + Shift + J or Cmd + Opt + J
// 4. Copy the code located in download_pdf.js and paste it into the console
// 5. Repeatedly press your Enter key


// Ctrl + A
// Ctrl + C
// Go paste! With haste! Quickly! Do it now!


function getCourseName() {
	var re = /((ACMA)|(ALS)|(APMA)|(ARAB)|(ARCH)|(ASC)|(BISC)|(BPK)|(BUS)|(BUEC)|(CHEM)|(CHIN)|(COGS)|(CMNS)|(CMPT)|(CRIM)|(DEVS)|(DIAL)|(DMED)|(EASC)|(ECO)|(ECON)|(EDUC)|(EDPR)|(ETEC)|(ENSC)|(ENGL)|(EAS)|(ENV)|(EVSC)|(EXPL)|(FPA)|(FNLG)|(FNST)|(FAL)|(FAN)|(FREN)|(GSWS)|(GS)|(GEOG)|(GERM)|(GERO)|(GRK)|(HSCI)|(HS)|(HIST)|(HUM)|(IAT)|(IS)|(ISPO)|(ITAL)|(JAPN)|(LBST)|(LANG)|(LAS)|(LBRL)|(LS)|(LING)|(MSSC)|(MTEC)|(MASC)|(MATH)|(MACM)|(MSE)|(MBB)|(MPP)|(NUSC)|(PERS)|(PHIL)|(PHYS)|(POL)|(PSYC)|(PLCY)|(PUB)|(REM)|(SCI)|(SA)|(SPAN)|(SAR)|(STAT)|(SCD)|(URB)|(WL))\s?\d+/;
	var name;

	// Check if static member is already initialized
	// Prevents reprompts for course name
	if(typeof getCourseName.courseName == 'undefined') {
		try {
			name = re.exec(document.title)[0];
		}
		catch(err) {
			name = window.prompt("Please enter course name:","");
		}

		getCourseName.courseName = name;
	}
	else {
		name = getCourseName.courseName;
	}

	return name;
}


/* Workaround to Chrome bug #373182 */
function downloadURI(sUrl, fileName) {
	window.URL = window.URL || window.webkitURL;

	var xhr = new XMLHttpRequest();
	xhr.open('GET', sUrl, true);
	xhr.responseType = 'blob';

	xhr.onload = function(e) {
		var res = xhr.response;
		var blob = new Blob([res], {type:"application/pdf"});

		url = window.URL.createObjectURL(blob);
		var a = document.createElement("a");
		document.body.appendChild(a);
		a.style = "display: none";
		a.href = url;
		a.download = fileName;
		a.click();
		window.URL.revokeObjectURL(url);
	};

	xhr.send();
}


function fixName(documentName, courseName) {
	// Split courseName into department and course number
	var dep = (/\w+/).exec(courseName)[0];
	var num = (/\d+/).exec(courseName)[0];
	var trail = "(\\s|_|\\-)?";
	var trailchar = "((\\s|_|\\-)\\w+)?";

	// Parse: Get filetype. If none, default to .pdf
	var re = new RegExp("\\.\\w+$");
	var filetype = re.exec(documentName);
	documentName = documentName.replace(re, "");

	// Parse: Remove char + course number from start of string
	re = new RegExp("^\\w+" + num + trail, "i");
	documentName = documentName.replace(re, "");

	// Parse: Remove dep and num
	re = new RegExp(
		"(" + dep + trail +
		")|(" + trailchar + num + trail +
		")",
		"ig");
	documentName = documentName.replace(re, "");

	// Parse: Convert "HW" to lowercase
	documentName = documentName.replace(/hw/ig, "hw");

	// Parse: Convert "mt" to uppercase, and replace "midterm"
	documentName = documentName.replace(/(MT)|(midterm)/ig, "MT");

	return courseName + " - " + documentName + filetype;
}


function downloadPDFs(category) {
	var pdflinks = [];
	var names = [];

	// Get download links
	Array.prototype.map.call(
		document.querySelectorAll("a[href*=\"download\"]"),
		function(e, i) {
			// If unique link found, push onto stack
			if((pdflinks || []).indexOf(e.href) == -1 &&
				/\d+\/download\?.+=1$/.test(e.href)) {
				pdflinks.push(e.href);
				names.push(e.textContent);
			}
		});

	// Log download links
	console.log(category + ":\n" + pdflinks.join("\n"));

	// Fix PDF names
	names.forEach(function (e, i) {
		names[i] = fixName(e, getCourseName());
	});

	// Execute downloads
	pdflinks.forEach(function (e, i) {
		downloadURI(e, names[i]);
	});
}


// Downloads everything
// Works only on /files tree
function downloadEverything() {
	var zip = document.querySelector("span[class=\"download_zip\"]");
	zip.click();
}


downloadPDFs("Download Links");
downloadEverything();

