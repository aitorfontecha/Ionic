const pa11y = require('pa11y');
const fs = require('fs')
const spawn = require("child_process").spawn;
const express = require('express')
const app = express()
const AxeBuilder = require('@axe-core/webdriverjs');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const cors = require('cors');
require('chromedriver');


const screen = {
    width: 1920,
    height: 1080
};
  
const driver = new webdriver.Builder()
.forBrowser('chrome')
.setChromeOptions(new chrome.Options().headless().windowSize(screen))
.build();

// const driver = new webdriver.Builder()
// .forBrowser('chrome')
// .build();


//const driver = new WebDriver.Builder().forBrowser('chrome').build()

app.use(cors())
app.set('json spaces', 2)
app.listen(3000)

app.get('/analyze/:site/', function (req, res) {
    res.setHeader('Content-Type','application/json')
    let webpage = req.params['site']
    let analysis = [];
    
    fs.readFile('./config.json',(err, data)=>{
        let script = JSON.parse(data)['scripts']['python_scraping']
        const pythonProcess = spawn('python',[script, webpage]);
        pythonProcess.stdout.on('data', (data) => { 
            pythonArray = JSON.parse(data.toString());


            pythonArray.forEach(cr => {
                if (!analysis.filter (el =>{ return (el.criteria === cr.criteria & el.type === cr.type)}).length){
                    analysis.push(cr)
                } else {
                    analysis.find(item => item.criteria === cr.criteria).html.push(...cr.html)
                    analysis.find(item => item.criteria === cr.criteria).html = [...new Set(analysis.find(item => item.criteria === cr.criteria).html)];

                    analysis.find(item => item.criteria === cr.criteria).source.push(...cr.source)
                    analysis.find(item => item.criteria === cr.criteria).source = [...new Set(analysis.find(item => item.criteria === cr.criteria).source)];
                }
            });
            
            analysis.sort((a, b) => (a.type > b.type) ? 1 : (a.type === b.type) ? ((a.criteria > b.criteria) ? 1 : -1) : -1 )
            console.log(analysis);
            res.json(analysis)
        })  
    })
    
    driver.get(`https://${webpage}`).then(() => {
        new AxeBuilder(driver).options({
            runOnly: {
                type: 'tag',
                values: ['wcag2a','wcag2aa','wcag2aaa']
            }
        }).analyze((err, results) => {
            fs.readFile('./criteria.json',(error, data) => {
                if (err) {
                
                } else {
                    
                    let criteriaFile = JSON.parse(data)
                    console.log(results);
                    let axe_violations = results.violations;
                    let axe_local_vioaltions = new Map();
                    
                    axe_violations.forEach(violation => {
                        let tags = violation['tags'].filter(value => /^wcag[0-9]{2,3}/.test(value));
                        let nodes = violation['nodes'];
                        tags.forEach((element,index) => {
                            let num = element.substring(4).split('').join('.');
                            let criteria = num + ' ' +criteriaFile[num].name;
                            let html = [];
                            nodes.forEach(node => {
                                html.push(node['html']);
                            });
                            if (!analysis.filter (el =>{ return (el.criteria === criteria & el.type === 'error')}).length){
                                analysis.push({
                                    "criteria":criteria,
                                    "level": criteriaFile[num].level,
                                    "link":criteriaFile[num].link,
                                    "html":html,
                                    "type":"error",
                                    "source":["axe"]
                                })
                            } else {
                                analysis.find(item => item.criteria === criteria).html.push(...html)
                                if(!analysis.find(item => item.criteria === criteria).source.includes('axe')){
                                    analysis.find(item => item.criteria === criteria).source.push('axe')
                                }
                            }
                        });
                    });
                }
            });
        });
    });


    pa11y(webpage).then((results) => {
        fs.readFile('./criteria.json',(err, data)=>{
            let criteriaFile = JSON.parse(data)
            let localData = new Map()
            results.issues.forEach(element => {
                let issueType = element.type;
                let principle = element.code.replace('Principle','').split('.')[1]+'.'
                let code = element.code.split('_')[1]
                let criteria = principle+code+' '+criteriaFile[principle+code].name
                let html = element.context

                if (!analysis.filter (el =>{ return el.criteria === criteria & el.type === issueType}).length){
                    analysis.push({
                        "criteria":criteria,
                        "level":criteriaFile[principle+code].level,
                        "link": criteriaFile[principle +code].link,
                        "html":[html],
                        "type": issueType,
                        "source":["pa11y"]
                    })
                } else {
                    analysis.find(item => item.criteria === criteria).html.push(html)
                    if(!analysis.find(item => item.criteria === criteria).source.includes('pa11y')){
                        analysis.find(item => item.criteria === criteria).source.push('pa11y')
                    }
                }
            });
        });
    });
    
    
})
        