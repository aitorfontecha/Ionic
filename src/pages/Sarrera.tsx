import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonFooter, IonItem, IonLabel, IonInput, IonButton } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Sarrera.css';
import React, { useState } from 'react';
import {useLocation} from "react-router-dom";
import queryString from 'query-string'


const Sarrera: React.FC = () => {
  const location = useLocation();
  const query = (queryString.parse(location.search));
  const input = (queryString.stringify(query)).split('=')[1];
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle size='large' >SGTA Scraping</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">SGTA Scraping</IonTitle>
          </IonToolbar>
        </IonHeader>
        <form className='search-form'  method='GET'>
          <IonLabel position="floating">Search</IonLabel>
          <IonInput value={'https://www.'} placeholder="URLa idatzi"></IonInput>
          <IonButton type="submit" color="primary" expand="block">Bilatu</IonButton>
          </form>
          <h1>URL: {decodeURIComponent(input)}</h1>
      </IonContent>
    </IonPage>
  );
};

export default Sarrera;
