FROM node:19.9.0

WORKDIR "/Mobile-app"

COPY . "/Mobile-app"

RUN yarn add expo

RUN yarn add expo-cli

RUN yarn install

VOLUME [ "/Mobile-app/node_modules" ]

EXPOSE 19000

CMD ["npm", "start"]