<h1 align="center">Chat simples em NodeJS + Kafka e Spark </h1></a>

<p align="center">
  <img  src="https://github.com/icarocarmona/chat/blob/master/imagens/Arquitetura.png" alt="arquitetura" />
</p>


A ideia dessa aplicação é demonstrar a utilização do Kafka e processamento de mensagens com Spark. 

## Roadmap
- Adicionar algoritmo que analisa as mensagens em tempo real;
- Definir data base;
- Criar uma receita de spark publica;


## Comandos

```sh
docker build -t icaro/node-web-chat .
```

```sh
docker-compose up -d
```

## Spark 
Para subir o spark utilize a seguinte receita de [Spark](https://github.com/big-data-europe/docker-spark)
