FROM nikolaik/python-nodejs:latest

WORKDIR /app

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
RUN apt-get update && apt-get -y install google-chrome-stable

WORKDIR /app/API

COPY ./API/package*.json ./

RUN npm install

RUN pip install selenium

COPY ./API .

WORKDIR /app/IONIC

COPY ./IONIC/package*.json ./

RUN npm install -g @ionic/cli

RUN npm install

COPY ./IONIC .

WORKDIR /app

COPY ./startup.sh .

EXPOSE 8100

RUN chmod 777 ./startup.sh

CMD ./startup.sh