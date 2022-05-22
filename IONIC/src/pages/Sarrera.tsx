import { IonContent, IonAvatar, IonSpinner, IonImg, IonIcon, IonThumbnail, IonHeader, IonList, IonListHeader,IonCardHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonFooter, IonItem, IonLabel, IonInput, IonButton, IonAccordionGroup, IonAccordion, IonText, IonGrid, IonRow, IonCol, IonRefresher, IonRefresherContent, IonButtons, IonCard, IonCardSubtitle, IonCardTitle, IonCardContent, IonTextarea} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import error from '../assets/error.svg'
import warning from '../assets/warning.svg'
import link from '../assets/link.svg'
import analyse from '../assets/analyse.svg'
import dark from '../assets/dark.svg'
import loadingGif from '../assets/loading.gif'
import analysingGif from '../assets/analysing.gif'
import { search } from 'ionicons/icons';
import './Sarrera.css';
import { CircularProgressbar, CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Sarrera: React.FC = () => {

  function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  // const toggleDarkModeHandler = () => {
  //   document.body.classList.toggle("dark");
  //   setDark(true)
  // };

  function getUrl() {
    let queryParams = new URLSearchParams(window.location.search);
    let site = queryParams.get('site');
    if (site) {
      console.log(encodeURI(site))
      
      return encodeURIComponent(site.replace('https://',''))
    } else {
      return ''
    }
  }


  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [score, setScore] = useState(0);
  // const [isDark,setDark] = useState(false)
  React.useEffect(() => {
    if (getUrl() != '') {
      sendRequest()
    }
    // if (isDark){
    //   toggleDarkModeHandler()
    // }
  }, []);

  const sendRequest = async () => {
    try {
      console.log('requesting....')
      setLoading(true);
  
      const data = await axios
        .get(`http://127.0.0.1:3000/analyze/${getUrl()}/`)
        .then(res => {
          console.log('requested!!');
          console.log(res);
          if (res.data.result === 'success') {
            console.log(items.length);
            setTotalElements(res.data.totalElements)
            setItems(res.data.evaluation)
            setScore(res.data.score)
          } else {
            console.log(items.length);
            
          }
        });
        document.getElementById('loading')?.classList.remove('animatedLoading')
        document.getElementById('loading')?.classList.add('coverLoading')
        await delay(200);
        setLoading(false);
    } catch (e)
    {
      console.log(e);
      setLoading(false);
    }
  };

  async function hideEvaluation(){
    document.getElementById('eval')?.classList.remove('animatedEvaluation')
    document.getElementById('eval')?.classList.add('coverEvaluation')
  }

  function isError(criteria:any){
    if (criteria.type === 'error') {
      return (
        <img src={error} />
      )
    } else {
      return(
        <img src={warning}/>
      )
    }
  }

  function elementNumber(){
    let elements = 0
    let errors = 0
    let warnings = 0
    for (var i=0; i < items.length; i++) {
      for (var j=0; j < items[i].html.length; j++) {
        elements++;
        if (items[i].type === 'error') {
          errors++; 
        } else {
          warnings++;
        }
      }
    }
    return [elements, errors, warnings]
  }

  function sources(criteria:any){
    let str = ''
    criteria.source.forEach((element:any, index:any) => {
      if (index + 1 === criteria.source.length && criteria.source.length != 1) {
        str += ' and '+ element
      } else if (index + 2 === criteria.source.length || criteria.source.length === 1) {
        str += element
      }
      else {
        str += element + ', '
      }
    });
    return str
  }

  function calcScore(){
    if (score === -1){
      let newScore = parseFloat(((totalElements - elementNumber()[0])/totalElements*10).toFixed(2))
      if (newScore > 7.5) {
        return [newScore, '#7fe77f']
      } else if (newScore > 5.0) {
        return [newScore, '#f59d05']
      } else {
        return [newScore, '#f06565']
      }
    } else {
      if (score > 7.5) {
        return [score, '#7fe77f']
      } else if (score > 5.0) {
        return [score, '#f59d05']
      } else {
        return [score, '#f06565']
      }
    }
  }

function render(){
  if (getUrl() != ''){
    if(items.length){

      return(
        <IonGrid class='animatedEvaluation' id='eval'>
          <IonRow>
            <IonCol>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle> 
                  <IonRow>
                    <IonCol>
                      <h1>Analysed page: <a style={{textDecoration: 'none'}} href={"https://"+decodeURIComponent(getUrl())} target="_blank"><IonText color='primary'>{"https://"+decodeURIComponent(getUrl())}</IonText></a></h1>
                    </IonCol>
                  </IonRow>
                </IonCardTitle>
                  <IonRow  class='ion-align-items-center'>
                    <IonCol size='2'>
                      <IonRow class='ion-justify-content-center'>
                        <IonCol size='5'>
                          <div style={{ width: 200, height: 200}}>
                            <CircularProgressbarWithChildren circleRatio={0.75} value={parseFloat(`${calcScore()[0]}`)} maxValue={10} styles={buildStyles({
                                          pathColor: `${calcScore()[1]}`,
                                          rotation: 1 / 2 + 1 / 8
                                        })}>
                              <IonRow class="ion-text-center">
                                <IonCol>
                                  <h1 style={{color: `${calcScore()[1]}`}}>{calcScore()[0]}<br/>Score</h1>
                                </IonCol>
                              </IonRow>
                            </CircularProgressbarWithChildren>
                          </div>
                        </IonCol>
                      </IonRow>
                    </IonCol>
                    <IonCol>
                      <IonCardSubtitle>
                        <IonRow class="ion-text-center">
                          <IonCol>
                            <h3>Analysed Elements: {totalElements}</h3>
                          </IonCol>
                          <IonCol>
                          <h4>Correct elements: <IonText class='correct'>{totalElements - elementNumber()[0]}</IonText></h4>
                          </IonCol>
                          <IonCol>
                            <h4>Errors: <IonText class='error'>{elementNumber()[1]}</IonText></h4>
                          </IonCol>
                          <IonCol>
                            <h4>Warnings: <IonText class='warning'>{elementNumber()[2]}</IonText></h4>
                          </IonCol>
                        </IonRow>
                        <IonRow class="ion-text-center">
                          <IonCol>
                            <IonButton download={`${getUrl()}_analysis.json`} href={'data:text/json;charset=utf-8,' + encodeURI(JSON.stringify(items, null, 2))}>Download data</IonButton>
                          </IonCol>
                        </IonRow>
                      </IonCardSubtitle>
                    </IonCol>
                  </IonRow>
              </IonCardHeader>

            </IonCard>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    <h1>Evaluation</h1>
                  </IonCardTitle>
                  <IonList>
                    <IonAccordionGroup>
                      {
                        items.map(item =>{
                          return (
                            <IonAccordion value={item['criteria'] + item['type']}>
                              <IonItem slot='header'>
                                  <IonThumbnail slot='start'>
                                    {isError(item)}
                                  </IonThumbnail>
                                  <IonGrid>
                                    <IonRow>
                                      <IonCol>
                                        <IonText><h5>{item['criteria']}</h5></IonText>
                                      </IonCol>
                                      <IonCol>
                                        <h5>Level: {item.level}</h5>
                                      </IonCol>
                                      <IonCol>
                                        <h5>Sources: {' ' + sources(item)}</h5>
                                      </IonCol>
                                    </IonRow>
                                  </IonGrid>
                                  <IonThumbnail slot='end'>
                                    <IonGrid>
                                      <IonRow>
                                        <IonCol>
                                          <a href={item.link} target="_blank"><IonImg src={link}/></a>
                                        </IonCol>
                                      </IonRow>
                                    </IonGrid>
                                  </IonThumbnail>
                              </IonItem>
                              <IonList slot="content" lines='inset' inset={true}>
                                <IonListHeader lines='inset'>
                                  <IonText><h4>Elements</h4></IonText>
                                </IonListHeader>
                                {item.html.map((node:any)=>{
                                  return(
                                    <IonItem>
                                      <IonText>{node}</IonText>
                                    </IonItem>
                                  )
                                })}
                              </IonList>
                            </IonAccordion>
                          );
                        })
                      } 
                    </IonAccordionGroup>
                  </IonList>
                </IonCardHeader>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      )
    } else {
      return (
        <IonGrid>
          <IonRow>
            <IonCol class="ion-text-center">
              <IonText class='error'><h1>We are sorry, something went wrong with the API. Try again later or try analysing a different page.</h1></IonText>
            </IonCol>
          </IonRow>
        </IonGrid>
      )
    }
  } else {
    return (
      <IonGrid>
          <IonRow>
            <IonCol class="ion-text-center">
                <h1>Enter a webpage to analyse its accessibility</h1>
            </IonCol>
          </IonRow>
        </IonGrid>
        )
  }
}

  return (
    <IonPage>
      <IonHeader>
        <IonCardHeader>
          <IonToolbar color='primary'>
            <IonButtons slot='start'>
            <IonButton href='/'  onClick={() => hideEvaluation()}>
            <img src={analyse} height='35px'></img>
            </IonButton>
            </IonButtons>
            {/* <IonButtons slot='end'>
              <IonButton onClick={toggleDarkModeHandler}>
              <img src={dark} height='35px'></img>
              </IonButton>
            </IonButtons> */}
            <IonTitle>SGTA Scraping</IonTitle>
          </IonToolbar>
          <form method='GET' onSubmit={() =>hideEvaluation()}>
            <IonItem>
              <h3><IonLabel><IonText color='primary'>Web page</IonText></IonLabel></h3>
              <h3><IonInput name='site' placeholder="https://" type="text"></IonInput></h3>
              <IonButton type="submit" color="primary" expand="block" slot='end' size="default">
                <IonIcon icon={search} slot='end'></IonIcon>
                Analyse
              </IonButton>
            </IonItem>
          </form>
        </IonCardHeader>
      </IonHeader>
      <IonContent>
        {loading ? 
          <IonGrid id='loading' class='animatedLoading'>
            <IonRow class='ion-justify-content-center ion-align-items-center'>
              <IonCol class="ion-text-center ion-margin-top">
                <img src={loadingGif} height='100px'></img>
              </IonCol>
            </IonRow>
            <IonRow class='ion-justify-content-center ion-align-items-center'>
              <IonCol class="ion-text-center">
                  <img src={analysingGif} width='200px'></img>
              </IonCol>
            </IonRow>
          </IonGrid> 
          :
          render()  
        }
      </IonContent>
    </IonPage>
  );
};

export default Sarrera;
