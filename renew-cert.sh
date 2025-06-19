#!/bin/bash

# Renovar certificados
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -v $(pwd)/certbot/logs:/var/log/letsencrypt \
  certbot/certbot renew \
  --webroot -w /var/www/certbot \
  --quiet \
  --deploy-hook "cp $(pwd)/certbot/conf/live/rifalosandes.es/fullchain.pem $(pwd)/ssl/ && \
                  cp $(pwd)/certbot/conf/live/rifalosandes.es/privkey.pem $(pwd)/ssl/"
