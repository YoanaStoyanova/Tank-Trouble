#!/bin/bash
scp -i "~/amazon/private-keys-m-390595c1-4ebc-4136-a807-4c280d450e5c-0.pem" ./target/TankTroubles-1.0-SNAPSHOT.jar ubuntu@54.154.212.251:/home/ubuntu/Tank-Trouble/Server/java-server/server.jar

tar -czf static.tar.gz static/

scp -i "~/amazon/private-keys-m-390595c1-4ebc-4136-a807-4c280d450e5c-0.pem" ./static.tar.gz ubuntu@54.154.212.251:/home/ubuntu/Tank-Trouble/Server/java-server/static.tgz

rm static.tar.gz

scp -i "~/amazon/private-keys-m-390595c1-4ebc-4136-a807-4c280d450e5c-0.pem" ./hibernate.properties ubuntu@54.154.212.251:/home/ubuntu/Tank-Trouble/Server/java-server/hibernate.properties


