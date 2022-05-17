import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonFooter, IonItem, IonLabel, IonInput, IonButton } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Bilaketa.css';
import React, { useState } from 'react';

const Bilaketa: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle size='large' >Emaitza</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Emaitza</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonLabel position="floating">Emaitza</IonLabel>
      </IonContent>
    </IonPage>
  );
};

export default Bilaketa;
