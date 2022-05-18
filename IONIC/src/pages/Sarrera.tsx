import { IonContent, IonAvatar, IonImg, IonHeader, IonList, IonCardHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonFooter, IonItem, IonLabel, IonInput, IonButton } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Sarrera.css';
import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import queryString from 'query-string'
import axios from 'axios';

const Sarrera: React.FC = () => {
  //useQuery() returns a string with the query parameters of the URL
  function useQuery() {
    const query = queryString.parse(useLocation().search);
    const input = (queryString.stringify(query)).split('=')[1];
    if (input) {
      return decodeURIComponent(input);
    }
  }
  const [items, setItems] = React.useState([]);
  React.useEffect(() => {
    sendRequest().then(data => {
      console.log(data);
      setItems(data);
    });
  }, []);
  const sendRequest = () => {
    console.log('requesting....')
    return axios(
      {
        url:'http://192.168.0.18:3000/analyze/google.com',
        method: 'get'
      })
      .then((response) => {
        console.log('requested!!');
        return response.data;
      })
  };

  return (
    <IonPage>
      <IonCardHeader>
        <IonToolbar color='primary'>
          <IonTitle size='large' >SGTA Scraping</IonTitle>
        </IonToolbar>
      </IonCardHeader>
      <IonContent>
        <form className='search-form' method='GET'>
          <IonLabel position="floating">Search</IonLabel>
          <IonInput value={'https://www.'} placeholder="URLa idatzi"></IonInput>
          <IonButton type="submit" color="primary" expand="block">Bilatu</IonButton>
        </form>
        <h1>URL: {useQuery()}</h1>
        <IonList color="primary">
          {
            items.map(item =>{
              return (
                <IonItem>
                  <IonLabel>
                    <h3> {item['criteria']} </h3>
                  </IonLabel>
                </IonItem>
              );
            })
          } 
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Sarrera;
