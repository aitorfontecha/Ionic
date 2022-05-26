from selenium import webdriver
from selenium.webdriver.common.by import By 
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import sys
import json
import threading, queue
import chromedriver_autoinstaller


aChecker = "https://achecker.achecks.ca/checker/index.php"
accessMonitor = "https://accessmonitor.acessibilidade.gov.pt/"
wcag_criteria = "https://www.w3.org/TR/WCAG21/"

def updateCriteriaDict(driver):
    driver.get(wcag_criteria)
    criteria_ids = driver.find_element(by=By.TAG_NAME, value="nav").find_elements(by=By.TAG_NAME, value="a")
    for cr in criteria_ids[3:]:
        if cr.text.split("\n")[0].count('.') >=2 and int(cr.text.split("\n")[0].split('.')[0]) in range(1,5):
            criteria_dic[cr.text.split("\n")[0]] = cr.text.split("\n")[1] 


def configDriver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    driver = webdriver.Chrome(options=options)
    return driver

def setSiteToAnalize():
    address="google.com"
    # address = input("Enter an address: ")
    if not address.startswith("https://"):
        address = "https://" + address
    return address
    

def aCheckerAnalisis(address, queue):
    # print('empieza ac \n')
    driver = configDriver()
    criteriaArray = []
    try:
        driver.get(aChecker)
        driver.find_element(by=By.ID,value="checkuri").send_keys(address)
        driver.find_element(by=By.ID,value="validate_uri").click()
        
        with open('./criteria.json', 'r') as crit:
            criteriaJSON = json.load(crit)
            errors = driver.find_element(by=By.ID,value="AC_errors").find_elements(by=By.TAG_NAME,value="table")

            for i in errors:
                # print(f'error {i} \n')
                criteria = i.find_element(by=By.XPATH, value="./preceding::h4[1]").text
                if criteria != "":
                    html = i.find_element(by=By.TAG_NAME, value="code").text
                    if not any(x['criteria'] == criteria.split(' ',2)[2].rsplit(' ', 1)[0] and x['type'] == 'error' for x in criteriaArray):
                        criteriaArray.append({
                            "criteria":criteria.split(' ',2)[2].rsplit(' ', 1)[0],
                            "level": criteriaJSON[criteria.split()[2]]['level'],
                            "link": criteriaJSON[criteria.split()[2]]['link'],
                            "html":[html],
                            "type":"error",
                            "source": ["AChecker"]
                        })
                    else:
                        for x in criteriaArray:
                            if x['criteria'] ==  criteria.split(' ',2)[2].rsplit(' ', 1)[0] and x['type'] == 'error':
                                if html not in x['html']:
                                    x['html'].append(html)
                                if "AChecker" not in x['source']:
                                    x['source'].append("AChecker")
                                break

            driver.find_element(by=By.ID,value="AC_menu_likely_problems").click()
            likely_problems = driver.find_element(by=By.ID,value="AC_likely_problems").find_elements(by=By.TAG_NAME,value="table")


            for i in likely_problems:
                # print(f'likely problem {i} \n')
                criteria = i.find_element(by=By.XPATH, value="./preceding::h4[1]").text
                if criteria != "":
                    html = i.find_element(by=By.TAG_NAME, value="code").text
                    if not any(x['criteria'] == criteria.split(' ',2)[2].rsplit(' ', 1)[0] and x['type'] == 'warning' for x in criteriaArray):
                        criteriaArray.append({
                            "criteria":criteria.split(' ',2)[2].rsplit(' ', 1)[0],
                            "level": criteriaJSON[criteria.split()[2]]['level'],
                            "link": criteriaJSON[criteria.split()[2]]['link'],
                            "html":[html],
                            "type":"warning",
                            "source": ["AChecker"]
                        })
                    else:
                        for x in criteriaArray:
                            if x['criteria'] ==  criteria.split(' ',2)[2].rsplit(' ', 1)[0] and x['type'] == 'warning':
                                if html not in x['html']:
                                    x['html'].append(html)
                                if "AChecker" not in x['source']:
                                    x['source'].append("AChecker")
                                break

            driver.find_element(by=By.ID,value="AC_menu_potential_problems").click()
            potential_problems = driver.find_element(by=By.ID,value="AC_potential_problems").find_elements(by=By.TAG_NAME,value="table")

            for i in potential_problems:
                # print(f'potential problem {i} \n')
                criteria = i.find_element(by=By.XPATH, value="./preceding::h4[1]").text
                if criteria != "":
                    html = i.find_element(by=By.TAG_NAME, value="code").text
                    if not any(x['criteria'] == criteria.split(' ',2)[2].rsplit(' ', 1)[0] and x['type'] == 'warning' for x in criteriaArray):
                        criteriaArray.append({
                            "criteria":criteria.split(' ',2)[2].rsplit(' ', 1)[0],
                            "level": criteriaJSON[criteria.split()[2]]['level'],
                            "link": criteriaJSON[criteria.split()[2]]['link'],
                            "html":[html],
                            "type":"warning",
                            "source": ["AChecker"]
                        })
                    else:
                        for x in criteriaArray:
                            if x['criteria'] ==  criteria.split(' ',2)[2].rsplit(' ', 1)[0] and x['type'] == 'warning':
                                if html not in x['html']:
                                    x['html'].append(html)
                                if "AChecker" not in x['source']:
                                    x['source'].append("AChecker")
                                break
    except:
        # print('Error with AChecker')
        pass
    finally:
        # print('termina ac \n')
        queue.put(criteriaArray)

def accessMonitorAnalisis(address, queue):
    # print('empieza am \n')
    driver = configDriver()
    driver.get(accessMonitor)
    #driver.find_element(by=By.XPATH, value='//button[@lang="en"]').click()
    driver.find_element(by=By.ID, value="url").send_keys(address)
    driver.find_element(by=By.NAME, value="url_validate").submit()

    criteriaArray = {"score":-1,"evaluation":[]}

    try:
        WebDriverWait(driver, timeout=30).until(EC.presence_of_element_located((By.CLASS_NAME, "rowerr")))

        criteriaArray['score'] = driver.find_element(by=By.CLASS_NAME, value="score").text.split()[0]


        errors = driver.find_elements(by=By.CLASS_NAME, value="rowerr")

        with open('./criteria.json', 'r') as crit:
            criteriaJSON = json.load(crit)
            # print('empeizan errores am \n')

            for er in range(0,len(errors)):
                html=getElementLocationPC(driver, driver.find_elements(by=By.CLASS_NAME, value="rowerr")[er])
                error = driver.find_elements(by=By.CLASS_NAME, value="rowerr")[er]
                error.find_element(by=By.XPATH, value="./following-sibling::td").find_element(by=By.TAG_NAME, value="button").click()
                criterias = error.find_element(by=By.XPATH, value="./following-sibling::td").find_elements(by=By.TAG_NAME, value="li")
                # print(f'error am {er} \n')
        
                for cr in criterias:
                    cr_p = cr.text[::-1].split(" ", 5)[5][::-1].replace("Success criteria ", "").replace("Level ", "")
                    criteria = cr_p.replace(" ", f" {criteriaJSON[ cr_p.split()[0]]['name']} ").rsplit(' ', 1)[0]
                    # print(f'criteria {criteria} \n')
            
                    
                    if not any(x['criteria'] == criteria and x['type'] == 'error' for x in criteriaArray['evaluation']):
                        criteriaArray['evaluation'].append({
                            "criteria":criteria,
                            "level": criteriaJSON[criteria.split()[0]]['level'],
                            "link": criteriaJSON[criteria.split()[0]]['link'],
                            "html":html,
                            "type":"error",
                            "source": ["AccessMonitor"]
                        })
                        # print('añadiendo error \n')
                
                    else:
                        for x in criteriaArray['evaluation']:
                            # print('buscando error\n')
                    
                            if x['criteria'] ==  criteria and x['type'] == 'error':
                                x['html'] += html
                                mylist = x['html']
                                x['html'] = list(set(mylist))
                                if "AccessMonitor" not in x['source']:
                                    x['source'].append("AccessMonitor")
                                # print('actualizando error\n')
                        
                                break

            warnings = driver.find_elements(by=By.CLASS_NAME, value="rowwar")
            # print('empeizan warnings am \n')

            for war in range(0,len(warnings)):
                # print(f'warning am {war} \n')
        
                html=getElementLocationPC(driver, driver.find_elements(by=By.CLASS_NAME, value="rowwar")[war])
                warning = driver.find_elements(by=By.CLASS_NAME, value="rowwar")[war]
                warning.find_element(by=By.XPATH, value="./following-sibling::td").find_element(by=By.TAG_NAME, value="button").click()
                criterias = warning.find_element(by=By.XPATH, value="./following-sibling::td").find_elements(by=By.TAG_NAME, value="li")
                for cr in criterias:
                    cr_p = cr.text[::-1].split(" ", 5)[5][::-1].replace("Success criteria ", "").replace("Level ", "")
                    criteria = cr_p.replace(" ", f" {criteriaJSON[ cr_p.split()[0]]['name']} ").rsplit(' ', 1)[0]
                    # print(f'criteria {criteria} \n')
            

                    if not any(x['criteria'] == criteria and x['type'] == 'warning' for x in criteriaArray['evaluation']):
                        criteriaArray['evaluation'].append({
                            "criteria":criteria,
                            "level": criteriaJSON[criteria.split()[0]]['level'],
                            "link": criteriaJSON[criteria.split()[0]]['link'],
                            "html":html,
                            "type":"warning",
                            "source": ["AccessMonitor"]
                        })
                        # print('añadiendo warning\n')
                
                    else:
                        for x in criteriaArray['evaluation']:
                            # print('buscando warning \n')
                    
                            if x['criteria'] ==  criteria and x['type'] == 'warning':
                                x['html'] += html
                                mylist = x['html']
                                x['html'] = list(set(mylist))
                                if "AccessMonitor" not in x['source']:
                                    x['source'].append("AccessMonitor")
                                # print('actualizando warning \n')
                        
                                break
    except Exception as e:
        # print('Error with AccessMonitor')
        pass
    finally:                        
        # print('termina am \n')
        queue.put(criteriaArray)

def getElementLocationPC(driver, elem):
    locations = []
    if "HTML error" not in elem.find_element(by=By.XPATH, value="..").find_element(by=By.CLASS_NAME, value="test_description").text:
            elem.find_element(by=By.XPATH, value="../td/a[@aria-label='Practice found']").click()
            elements = driver.find_elements(by=By.XPATH, value="//table/tr[2]/td/code")

            for element in elements:
                locations.append(element.text)
            driver.back()

    return locations


if __name__ == "__main__":
    address = sys.argv[1]
    
    response = {"score":0,"evaluation":[]}

    # address = setSiteToAnalize()
    chromedriver_autoinstaller.install()
    aCheckerQueue = queue.Queue()
    accessMonitorQueue = queue.Queue()

    t1 = threading.Thread(target=aCheckerAnalisis, args=(address,aCheckerQueue))
    t2 = threading.Thread(target=accessMonitorAnalisis, args=(address,accessMonitorQueue))
    t1.start()
    t2.start()

    t1.join()
    t2.join()
    
    criteriaArrayAC = aCheckerQueue.get()

    criteriaArrayAM = accessMonitorQueue.get()

    response['score'] = criteriaArrayAM['score']

    for cr in criteriaArrayAC + criteriaArrayAM['evaluation']:
        if not any(x['criteria'] == cr['criteria'] and x['type'] == cr['type'] for x in response['evaluation']):
            response['evaluation'].append(cr)
        else:
            for x in response['evaluation']:
                if x['criteria'] ==  cr['criteria'] and x['type'] == cr['type']:
                    x['html'] += cr['html']
                    mylist = x['html']
                    x['html'] = list(set(mylist))
                    if cr['source'] not in x['source']:
                        x['source'] += (cr['source'])
                    break

    with open('./test.json', 'w') as f:
        f.write(json.dumps(response,indent=4))
        
    sys.stdout.write(json.dumps(response,indent=4))

    # e_AM, w_AM = accessMonitorAnalisis(driver, address)

    # resJson = {}

    # resJson['AChecker_errors'] = e_AC
    # resJson['AChecker_likely_problems'] = lp_AC
    # resJson['AChecker_potential_problems'] = pp_AC

    # resJson['AccessMonitor_errors'] = e_AM
    # resJson['AccessMonitor_warnings'] = w_AM

    # print(json.dumps(resJson,indent=4))

    sys.stdout.flush()

    exit()