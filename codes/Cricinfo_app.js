// the purpose of this project is to extract information of worldcup 2019 from cricinfo and present
// that in the form of excel and pdf scorecards
// the real purpose is to learn how to extract information and get experience with js
// A very good reason to ever make a project is to have good fun

// npm init -y
// npm install minimist
// npm install axios
// npm install jsdom
// npm install excel4node
// npm install pdf-lib

// node Cricinfo_app.js --excel=Worldcup_2019.csv --dataFolderss=matches --source=https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results 

let minimist = require("minimist");
let axios = require("axios");
let jsdom = require("jsdom");
let excel = require("excel4node");
let pdf = require("pdf-lib")
let fs = require("fs");
let path = require("path");

let args = minimist(process.argv);

// download using axios
// extract information using jsdom
// manipulate data using array functions
// save in excel using excel4node
// create folders and prepare pdfs

let reponseKaPromise = axios.get(args.source);
reponseKaPromise.then(function (response) {
    let html = response.data;

    let dom = new jsdom.JSDOM(html);
    let document = dom.window.document;

    let matches = [];
    let matchdivs = document.querySelectorAll("div.match-score-block");
    for (let i = 0; i < matchdivs.length; i++) {
        let matchdiv = matchdivs[i];
        let match = {
            t1: "",
            t2: "",
            t1s: "",
            t2s: "",
            result: ""
        };

        let teamParas = matchdiv.querySelectorAll("div.name-detail > p.name");
        match.t1 = teamParas[0].textContent; // team 1 from match
        match.t2 = teamParas[1].textContent; // team 2 from match

        let scoreSpans = matchdiv.querySelectorAll("div.score-detail > span.score"); // storing the scores from match
        if (scoreSpans.length == 2) {
            match.t1s = scoreSpans[0].textContent;
            match.t2s = scoreSpans[1].textContent;
        } else if (scoreSpans.length == 1) {
            match.t1s = scoreSpans[0].textContent;
            match.t2s = "";
        } else {
            match.t1s = "";
            match.t2s = "";
        }

        let resultSpan = matchdiv.querySelector("div.status-text > span"); // result from the match
        match.result = resultSpan.textContent;

        matches.push(match);
    }

    let matchesJSON = JSON.stringify(matches); 
    fs.writeFileSync("matches.json", matchesJSON, "utf-8"); // forming the json for all matches

    // restructuring the matches.json to teams.json to frame it in teams perspective. Earlier it was in match perspective
    let teams = []; 
    for (let i = 0; i < matches.length; i++) {
        putTeamInTeamsArrayIfMissing(teams, matches[i]); 
    }

    for (let i = 0; i < matches.length; i++) {
        putMatchInAppropriateTeam(teams, matches[i]); 
    }

    let teamsJSON = JSON.stringify(teams); 
    fs.writeFileSync("teams.json", teamsJSON, "utf-8"); 

    createExcelFile(teams);
    createFolders(teams);
})

function createFolders(teams) {
    fs.mkdirSync(args.dataFolderss);    //creating a folder called matches
    for (let i = 0; i < teams.length; i++) {
        let teamFN = path.join(args.dataFolderss, teams[i].name); //forming the path to the team name
        fs.mkdirSync(teamFN); //creating a foler with that path name

        for (let j = 0; j < teams[i].matches.length; j++) {
            let matchFileName = path.join(teamFN, teams[i].matches[j].vs + ".pdf");// creating path to pdf which contains details of the matches a team played against other teams: like ind vs pak, ind vs eng. So the pdf will be pak, eng under folder ind
            createScoreCard(teams[i].name, teams[i].matches[j], matchFileName);
        }
    }
}

function createScoreCard(teamName, match, matchFileName) {
    let t1 = teamName;
    let t2 = match.vs;
    let t1s = match.selfScore;
    let t2s = match.oppScore;
    let result = match.result;

    let bytesOfPDFTemplate = fs.readFileSync("Template.pdf");
    let pdfdocKaPromise = pdf.PDFDocument.load(bytesOfPDFTemplate);
    pdfdocKaPromise.then(function(pdfdoc){  //editing the pdf doc, positioning the text with respect to the template
        let page = pdfdoc.getPage(0);

        page.drawText(t1, {
            x: 320,
            y: 701,
            size: 8
        });
        page.drawText(t2, {
            x: 320,
            y: 687,
            size: 8
        });
        page.drawText(t1s, {
            x: 320,
            y: 673,
            size: 8
        });
        page.drawText(t2s, {
            x: 320,
            y: 659,
            size: 8
        });
        page.drawText(result, {
            x: 320,
            y: 645,
            size: 8
        });

        let finalPDFBytesKaPromise = pdfdoc.save();
        finalPDFBytesKaPromise.then(function(finalPDFBytes){
            fs.writeFileSync(matchFileName, finalPDFBytes);
        })
    })
}

function createExcelFile(teams) {
    let wb = new excel.Workbook();
    let hstyle=wb.createStyle({
        font : {
            color : "red"
        },
        fill : {
            type : "pattern",
            patternType : "solid",
            fgColor : "00FF00"
        }
    });
    for (let i = 0; i < teams.length; i++) {    //editing the excel sheet
        let sheet = wb.addWorksheet(teams[i].name);

        sheet.cell(1, 1).string("VS").style(hstyle);
        sheet.cell(1, 2).string("Self Score").style(hstyle);
        sheet.cell(1, 3).string("Opp Score").style(hstyle);
        sheet.cell(1, 4).string("Result").style(hstyle);
        for (let j = 0; j < teams[i].matches.length; j++) {
            sheet.cell(j+2, 1).string(teams[i].matches[j].vs);
            sheet.cell(2 + j, 2).string(teams[i].matches[j].selfScore);
            sheet.cell(2 + j, 3).string(teams[i].matches[j].oppScore);
            sheet.cell(2 + j, 4).string(teams[i].matches[j].result);
        }
    }

    wb.write(args.excel);
}

function putTeamInTeamsArrayIfMissing(teams, match) {
    let t1idx = -1;
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].name == match.t1) {
            t1idx = i;
            break;
        }
    }

    if (t1idx == -1) {
        teams.push({
            name: match.t1,
            matches: []
        });
    }

    let t2idx = -1;
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].name == match.t2) {
            t2idx = i;
            break;
        }
    }

    if (t2idx == -1) {
        teams.push({
            name: match.t2,
            matches: []
        });
    }
}

function putMatchInAppropriateTeam(teams, match) {
    let t1idx = -1;
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].name == match.t1) {
            t1idx = i;
            break;
        }
    }

    let team1 = teams[t1idx];
    team1.matches.push({
        vs: match.t2,
        selfScore: match.t1s,
        oppScore: match.t2s,
        result: match.result
    });

    let t2idx = -1;
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].name == match.t2) {
            t2idx = i;
            break;
        }
    }

    let team2 = teams[t2idx];
    team2.matches.push({
        vs: match.t1,
        selfScore: match.t2s,
        oppScore: match.t1s,
        result: match.result
    });
}