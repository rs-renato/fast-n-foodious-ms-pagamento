#!/bin/bash
awslocal sqs create-queue --endpoint-url http://localhost:4566 --queue-name sqs-dlq.fifo --attributes "FifoQueue=true","DelaySeconds=0"
awslocal sqs create-queue --endpoint-url http://localhost:4566 --queue-name sqs-dlq --attributes "DelaySeconds=0"

awslocal sqs create-queue --endpoint-url http://localhost:4566 --queue-name webhook-pagamento-rejeitado-res --attributes '{"RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:sqs-dlq\",\"maxReceiveCount\":\"3\"}","VisibilityTimeout":"1"}'
awslocal sqs create-queue --endpoint-url http://localhost:4566 --queue-name webhook-pagamento-confirmado-res --attributes '{"RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:sqs-dlq\",\"maxReceiveCount\":\"3\"}","VisibilityTimeout":"1"}'
awslocal sqs create-queue --endpoint-url http://localhost:4566 --queue-name solicitar-pagamento-req.fifo --attributes '{"FifoQueue":"true","RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:sqs-dlq.fifo\",\"maxReceiveCount\":\"3\"}","VisibilityTimeout":"1"}'
awslocal sqs create-queue --endpoint-url http://localhost:4566 --queue-name preparacao-pedido-req.fifo --attributes '{"FifoQueue":"true","RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:sqs-dlq.fifo\",\"maxReceiveCount\":\"3\"}","VisibilityTimeout":"1"}'
awslocal sqs create-queue --endpoint-url http://localhost:4566 --queue-name lgpd-protocolo-delecao-req.fifo --attributes '{"FifoQueue":"true","RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:sqs-dlq.fifo\",\"maxReceiveCount\":\"3\"}","VisibilityTimeout":"1"}'

awslocal sqs list-queues --endpoint-url http://localhost:4566

awslocal ses verify-email-identity --email-address sac.fast.n.foodious@gmail.com --endpoint-url=http://localhost:4566