echo Input Common Name
read CN
openssl req -x509 -newkey rsa:4096 -keyout server/scripts/server_key.pem -out server/scripts/server_cert.pem -nodes -days 365 -subj "/CN=$CN"
