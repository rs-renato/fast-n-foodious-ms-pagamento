FROM node:18.19-alpine

ENV TZ=America/Sao_Paulo

WORKDIR /fast-n-foodious-ms-pagamento

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000 3001 3002

CMD ["npm", "start"]