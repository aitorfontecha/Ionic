FROM python

# update 
RUN apt-get update
# install curl 
RUN apt-get install curl
# get install script and pass it to execute: 
RUN curl -LO https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

RUN apt-get -y install dbus-x11 xfonts-base xfonts-100dpi xfonts-75dpi xfonts-cyrillic xfonts-scalable
RUN apt-get -y install libxss1 lsb-release xdg-utils

RUN apt-get install -y ./google-chrome-stable_current_amd64.deb
RUN rm google-chrome-stable_current_amd64.deb 
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y nodejs 
RUN apt-get install --no-install-recommends apt-utils --yes \
    && apt-get install --no-install-recommends npm --yes
RUN npm -g install chromedriver

WORKDIR /app

WORKDIR /app/API

COPY ./API/package*.json ./

RUN npm install

RUN pip install selenium

RUN pip install chromedriver-autoinstaller

COPY ./API .

WORKDIR /app/IONIC

COPY ./IONIC/package*.json ./

RUN npm install -g @ionic/cli

RUN npm install

COPY ./IONIC .

WORKDIR /app

COPY ./startup.sh .

RUN chmod 777 ./startup.sh
EXPOSE 3000
EXPOSE 8100
EXPOSE 80
EXPOSE 443


CMD ./startup.sh