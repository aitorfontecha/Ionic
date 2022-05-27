const pa11y = require('pa11y');
const fs = require('fs')
const spawn = require("child_process").spawn;
const express = require('express')
const app = express()
const AxeBuilder = require('@axe-core/webdriverjs');
const webdriver = require('selenium-webdriver');
const {By} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const cors = require('cors');
require('chromedriver');
const fetch = require('node-fetch');


const screen = {
    width: 1920,
    height: 1080
};
let driver
const builder = new webdriver.Builder().forBrowser('chrome')
let options = new chrome.Options();
options.headless();                             // run headless Chrome
options.addArguments(['--headless']);
options.addArguments(['--no-sandbox']);    
driver = builder.setChromeOptions(options).build();


// const driver = new webdriver.Builder()
// .forBrowser('chrome')
// .build();


//const driver = new WebDriver.Builder().forBrowser('chrome').build()

app.use(cors())
app.set('json spaces', 2)
app.listen(3000, () => console.log('App available on http://localhost:3000'))

app.get('/analyze/:site/', function (req, res) {
    try {
        
        let callBacks = 0;
        res.setHeader('Content-Type','application/json')
        let webpage = decodeURIComponent(req.params['site'])

        fetch(new URL(`https://${webpage}`)).then((response)=>{
            if (response.status != 404){

                let analysis = {'result':'success', 'totalElements':0, 'score':-1,'evaluation':[]};
                
                fs.readFile('./config.json',(err, data)=>{
                    console.log('Empieza python');
                    let script = JSON.parse(data)['scripts']['python_scraping']
                    const pythonProcess = spawn('python',[script, webpage]);
                    pythonProcess.stdout.on('data', (data) => { 
                        console.log("python done")
                        // fs.writeFileSync('./testPy.json','test')
                        // console.log(String.fromCharCode.apply(null, data));
                        // fs.writeFileSync('./testPy.json', String.fromCharCode.apply(null, data));
                        try {
                            pythonArray = JSON.parse(data.toString());
                            analysis.score = pythonArray.score
                            
                            pythonArray.evaluation.forEach(cr => {
                                if (!analysis.evaluation.filter (el =>{ return (el.criteria === cr.criteria & el.type === cr.type)}).length){
                                    analysis.evaluation.push(cr)
                                } else {
                                    analysis.evaluation.find(item => item.criteria === cr.criteria).html.push(...cr.html)
                                    analysis.evaluation.find(item => item.criteria === cr.criteria).html = [...new Set(analysis.evaluation.find(item => item.criteria === cr.criteria).html)];
                                    
                                    analysis.evaluation.find(item => item.criteria === cr.criteria).source.push(...cr.source)
                                    analysis.evaluation.find(item => item.criteria === cr.criteria).source = [...new Set(analysis.evaluation.find(item => item.criteria === cr.criteria).source)];
                                }
                            });
                            
                            analysis.evaluation.sort((a, b) => (a.type > b.type) ? 1 : (a.type === b.type) ? ((a.criteria > b.criteria) ? 1 : -1) : -1 )
                            
                        } catch (error) {
                            console.log(error);
                            console.log("Terrible problems python");
                            // analysis = {'result':'error'}
                        } finally {
                            console.log("termina python");
                            callBacks ++;
                            if (callBacks === 3) {
                                console.log(analysis);
                                res.json(analysis)
                            }
                        }
                    })  
                })
            
                driver.get(`https://${webpage}`).then(() => {
                    console.log("Empieza axe");
                    driver.findElements(By.xpath('//*')).then((elements)=>{
                        analysis.totalElements = elements.length
                    })
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
                                        if (!analysis.evaluation.filter (el =>{ return (el.criteria === criteria & el.type === 'error')}).length){
                                            analysis.evaluation.push({
                                                "criteria":criteria,
                                                "level": criteriaFile[num].level,
                                                "link":criteriaFile[num].link,
                                                "html":html,
                                                "type":"error",
                                                "source":["axe-core"]
                                            })
                                        } else {
                                            analysis.evaluation.find(item => item.criteria === criteria).html.push(...html)
                                            if(!analysis.evaluation.find(item => item.criteria === criteria).source.includes('axe-core')){
                                                analysis.evaluation.find(item => item.criteria === criteria).source.push('axe-core')
                                            }
                                        }
                                    });
                                });
                            }
                        });
                        callBacks ++;
                        console.log("Termina axe");
                        if (callBacks === 3) {
                            console.log(analysis);
                            res.json(analysis)
                        }
                    });
                });
                
                
                pa11y(webpage,{
                        "chromeLaunchConfig": {
                            "args": ["--no-sandbox"]
                        }}).then((results) => {
                    fs.readFile('./criteria.json',(err, data)=>{
                        console.log("Empieza pa11y");
                        let criteriaFile = JSON.parse(data)
                        let localData = new Map()
                        results.issues.forEach(element => {
                            let issueType = element.type;
                            let principle = element.code.replace('Principle','').split('.')[1]+'.'
                            let code = element.code.split('_')[1]
                            if (principle+code in criteriaFile){
                                let criteria = principle+code+' '+criteriaFile[principle+code].name
                                let html = element.context
                                
                                if (!analysis.evaluation.filter (el =>{ return el.criteria === criteria & el.type === issueType}).length){
                                    analysis.evaluation.push({
                                        "criteria":criteria,
                                        "level":criteriaFile[principle+code].level,
                                        "link": criteriaFile[principle +code].link,
                                        "html":[html],
                                        "type": issueType,
                                        "source":["Pa11y"]
                                    })
                                } else {
                                    analysis.evaluation.find(item => item.criteria === criteria).html.push(html)
                                    if(!analysis.evaluation.find(item => item.criteria === criteria).source.includes('Pa11y')){
                                        analysis.evaluation.find(item => item.criteria === criteria).source.push('Pa11y')
                                    }
                                }
                            }
                        });
                        console.log("Termina pa11y");
                        callBacks++;
                        if (callBacks === 3) {
                            console.log(analysis);
                            res.json(analysis)
                        }
                    });
                });
                if (callBacks === 3) {
                    console.log(analysis);
                    res.json(analysis)
                }
            } else {
                analysis = {'result':'not found'}
                res.json(analysis)
            }
        }).catch(err=>{
            analysis = {'result':'not found'}
            res.json(analysis)
        })
    } catch (error) {
        console.log("Terrible problems everywhere: "+error);
        analysis = {'result':'error'}
        res.json(analysis)
    }
    
})
