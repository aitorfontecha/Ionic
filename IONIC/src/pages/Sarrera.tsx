import { IonContent, IonAvatar, IonSpinner, IonImg, IonIcon, IonThumbnail, IonHeader, IonList, IonListHeader,IonCardHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonFooter, IonItem, IonLabel, IonInput, IonButton, IonAccordionGroup, IonAccordion, IonText, IonGrid, IonRow, IonCol, IonRefresher, IonRefresherContent, IonButtons, IonCard, IonCardSubtitle, IonCardTitle, IonCardContent} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import error from '../assets/error.svg'
import warning from '../assets/warning.svg'
import link from '../assets/link.svg'
import analyse from '../assets/analyse.svg'
import loadingGif from '../assets/loading.gif'
import analysingGif from '../assets/analysing.gif'
import { search } from 'ionicons/icons';

const Sarrera: React.FC = () => {

  function getUrl() {
    let queryParams = new URLSearchParams(window.location.search);
    let site = queryParams.get('site');
    console.log(site);
    if (site) {
      return site.replace('http[s]+://','')
    }
  }


  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  React.useEffect(() => {
    if (getUrl()) {
      sendRequest()
    }
  }, []);

  const sendRequest = async () => {
    try {
      console.log('requesting....')
      setLoading(true);
      const data = await axios
        .get(`http://192.168.0.11:3000/analyze/${getUrl()}/`)
        .then(res => {
          console.log('requested!!');
          console.log(res);
          setItems(res.data)
        });
        setLoading(false);
    } catch (e)
    {
      console.log(e);
      setLoading(false);
    }
  };

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
    let number = 0
    for (var i=0; i < items.length; i++) {
      for (var j=0; j < items[i].html.length; j++) {
        number++;
      }
    }
    return number
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

function render(){
  if (getUrl()){
    if(items.length){
      return(
        <IonGrid>
          <IonRow>
            <IonCol>
             
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle> <h1>Analysed page: <a style={{textDecoration: 'none'}} href={"https://"+getUrl()} target="_blank"><IonText color='primary'>{getUrl()}</IonText></a></h1></IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {elementNumber()}
              </IonCardContent>
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
                            <IonAccordion value={item['criteria']}>
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
              <IonText><h1>We are sorry, something went wrong with the API. Try again later or try analysing a different page.</h1></IonText>
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
      <IonContent>
        <IonCardHeader>
          <IonToolbar color='primary'>
            <IonButtons slot='start'>
            <IonButton href='/'>
            <img src={analyse} height='35px'></img>
            </IonButton>
            </IonButtons>
            <IonTitle>SGTA Scraping</IonTitle>
          </IonToolbar>
        </IonCardHeader>
        <form className='search-form' method='GET'>
          <IonItem>
            <h3><IonLabel><IonText color='primary'>Web page</IonText></IonLabel></h3>
            <h3><IonInput name='site' placeholder="http(s)://" type="text"></IonInput></h3>
            <IonButton type="submit" color="primary" expand="block" slot='end' size="default">
              <IonIcon icon={search} slot='end'></IonIcon>
              Analyse
            </IonButton>
          </IonItem>
        </form>
        {loading ? 
          <IonGrid>
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
