
# Cricket World Cup 2019 Web-scraping Project using NodeJS modules

#### In this project we will be scraping the cricinfo world cup 2019 fixture webpage and extract all the matches details (team names and results) and store it in different forms (json, excel, pdf).
![cricinfo-19](https://raw.githubusercontent.com/Jas-Script/Web_Development/master/JavaScript%20Module/Cricinfo%20Scrapping%20Activity/pics%20for%20readme/8.PNG)

#### In order to generate an excel file, pdf file and json file containing details of world cup matches follow the steps:

#### 1. Open Cricinfo_app.js in your editor 
#### 2. Install the following libraries 

##### a. AXIOS
##### b. JSDOM
##### c. EXCEL4NODE
##### d. MINIMIST
##### e. PDF-LIB
#### Command for Installing these npm modules :
```
npm init -y
npm install minimist
npm install excel4node
npm install jsdom
npm install axios
npm install pdf-lib
```

#### After installation run the following command 
```
node Cricinfo_app.js --excel=Worldcup_2019.csv --dataFolderss=matches --source=https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results 
```
### RESULTS
####  Matches JSON File
![image](https://user-images.githubusercontent.com/73374498/137577155-0756e373-c675-43ae-904a-daca106f1300.png)

####  Teams JSON File
![image](https://user-images.githubusercontent.com/73374498/137577231-e88769bd-a12c-429b-a649-f71bee1910aa.png)

#### EXCEL File
![image](https://user-images.githubusercontent.com/73374498/137577262-f4cccc8e-b7ae-4d2f-8c01-f5cdbdeca41f.png)

#### Pdf File
![image](https://user-images.githubusercontent.com/73374498/137577318-2ec91aa4-ba60-4f3c-9fa3-35708b7a5556.png)
