#!/bin/bash

sudo apt install ./minikube_latest_amd64.deb
#  --image-repository='' --insecure-registry=[]
minikube start --disk-size=10g --cpus=2 --memory=4g --gpus=nvidia --network='host' -p minibox


curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
sudo apt install -y bash-completion
source <(kubectl completion bash)
echo 'source <(kubectl completion bash)' >>~/.bashrc
kubectl proxy

minikube -p minibox addons enable metrics-server
minikube -p minibox addons enable dashboard
minikube -p minibox dashboard --url


# docker build -t image-name:tag .
# eval $(minikube docker-env)
# kubectl create -f k8-busy-box.yaml

kubectl get pods
kubectl describe pod <pod-name>
kubectl logs -f <pod-name>

kubectl get service
kubectl describe service <service-name>
minikube -p minibox service <service-name> --url
