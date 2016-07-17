#!/bin/bash

processId=$(lsof -i:8000 | grep node | awk '{print $2}')

if [ -z "$processId" ]
then
    printf "\n No Open Node Process on Port 8000 \n\n"
else
    printf "\n Killing Node Process on Port 8000 with PID -> $processId \n"
    kill -9 $processId
fi
