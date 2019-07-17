#! /bin/bash

rsync -avz -e "ssh -p 6666" --delete --exclude-from 'deploy_exclude.txt' package.json package-lock.json server scott@112.74.83.47:~/luowang
rsync -avz -e "ssh -p 6666" --delete --exclude-from 'deploy_exclude.txt' dist scott@112.74.83.47:~/luowang
