# UrStyle - Personal Fashion Recommendation App

![version](https://img.shields.io/badge/version-1.0.1-blue.svg)  [![GitHub issues open](https://github.com/Capstone-Project-UrStyle/Mobile-app/issues)]

![Product](![image](https://github.com/Capstone-Project-UrStyle/Mobile-app/assets/87163945/f1a47eca-4108-4237-b5e4-1d65b4f0c7a8))

This app is builted base on Soft UI React Native template. This is a fully coded app template built over [React Native](https://facebook.github.io/react-native/?ref=creativetim) and [Expo](https://expo.io/?ref=creativetim) to allow you to create powerful and beautiful e-commerce mobile applications. We have redesigned all the usual components in-house to make it look like Soft UI's KIT, minimalistic and easy to use.

View [all components here](https://demos.creative-tim.com/soft-ui-react-native/).

## Table of Contents

* [Versions](#versions)
* [Requirements](#requirements)
* [Install steps](#install-steps)
* [Useful Links](#useful-links)

## Requirements

- Clone all three repos into same directory:
  1. [Backend Server](https://github.com/Capstone-Project-UrStyle/Back-end).
  2. [AI Server](https://github.com/Capstone-Project-UrStyle/AI-server).
  3. [Mobile App](https://github.com/Capstone-Project-UrStyle/Mobile-app).
- [Install Docker and Compose plugin](https://docs.docker.com/compose/install/)
- Install ifconfig command to get the current network IP address:
```sh
  $ sudo apt update
  $ sudo apt install net-tools
```
- Download the Inception v3 Checkpoint:
```shell
# Save the Inception v3 checkpoint in /AI-server/models folder.
wget "http://download.tensorflow.org/models/inception_v3_2016_08_28.tar.gz"
tar -xvf "inception_v3_2016_08_28.tar.gz" -C ${INCEPTION_DIR}
rm "inception_v3_2016_08_28.tar.gz"
```
- [Download trained model from here](https://drive.google.com/drive/folders/0B4Eo9mft9jwoVDNEWlhEbUNUSE0?resourcekey=0-vQg9TMSLKnmPCuuWwl5Ebw) and save it /AI-server/models folder
- [Download all the images from here](https://drive.google.com/file/d/0B4Eo9mft9jwoNm5WR3ltVkJWX0k/view?resourcekey=0-U-30d1POF7IlnAE5bzOzPA) and save all in /Back-end/public/images/items folder

## Install steps

- cd /AI-server
- cd /Back-end
- Run ifconfig and copy the current network IP address
- Paste copied IP address in file docker-compose.yaml at line 89
- Run docker compose up -d
- To view all running container, run docker ps
- To access into a specific container, run docker exec -it [container's name] /bin/bash
- To view the logs of a container, run docker logs -f [container's name]

## Useful Links

- [Tutorials](https://www.youtube.com/channel/UCVyTG4sCw-rOvB9oHkzZD1w)
- [Affiliate Program](https://www.creative-tim.com/affiliates/new) (earn money)
- [Blog Creative Tim](http://blog.creative-tim.com/)
- [Free Products](https://www.creative-tim.com/bootstrap-themes/free) from Creative Tim
- [Premium Products](https://www.creative-tim.com/bootstrap-themes/premium) from Creative Tim
- [React Products](https://www.creative-tim.com/bootstrap-themes/react-themes) from Creative Tim
- [Angular Products](https://www.creative-tim.com/bootstrap-themes/angular-themes) from Creative Tim
- [VueJS Products](https://www.creative-tim.com/bootstrap-themes/vuejs-themes) from Creative Tim
- [More products](https://www.creative-tim.com/bootstrap-themes) from Creative Tim
- Check our Bundles [here](https://www.creative-tim.com/bundles?ref=soft-ui-github-readme)


### Social Media

Facebook: <https://www.facebook.com/KietBunzz>
Instagram: <https://www.instagram.com/_bunzz_0904/>
