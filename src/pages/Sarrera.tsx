import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonFooter, IonItem, IonLabel, IonInput, IonButton } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Sarrera.css';
import React, { useState } from 'react';
import { useSearchParams } from "react-router-dom";

const Sarrera: React.FC = () => {
    let [searchParams, setSearchParams] = useSearchParams();
    let input = searchParams.get('ion-input-0');
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
        <form className='search-form' method='GET'>
          <IonLabel position="floating">Bilatu</IonLabel>
          <IonInput placeholder="URLa idatzi"></IonInput>
          <IonButton type="submit" color="primary" expand="block">Bilatu</IonButton>
          </form>
        <IonLabel></IonLabel>
      </IonContent>
    </IonPage>
  );
};

export default Sarrera;
