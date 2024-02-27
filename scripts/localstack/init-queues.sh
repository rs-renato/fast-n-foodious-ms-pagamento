#!/bin/bash
awslocal sqs create-queue --endpoint-url http://localhost:4566 --queue-name webhook-pagamento-rejeitado-res
awslocal sqs create-queue --endpoint-url http://localhost:4566 --queue-name webhook-pagamento-confirmado-res
awslocal sqs create-queue --endpoint-url http://localhost:4566 --queue-name solicitar-pagamento-req.fifo --attributes "FifoQueue=true"
awslocal sqs list-queues --endpoint-url http://localhost:4566
