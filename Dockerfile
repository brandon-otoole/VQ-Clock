##################################################
#                                                #
#  The base setup for dev and production images  #
#                                                #
##################################################

FROM node:20.9-bookworm-slim as base

# Create app directory
WORKDIR /app

# install config files for node
COPY package*.json ./

# install webpack base config
COPY ./webpack.config.js ./

########## ########## ##########

##################################################
#                                                #
#           Development Live Server              #
#                                                #
##################################################
FROM base as development

# mount the source code
VOLUME ./src

# copy webpack development config
COPY ./webpack.dev.js ./

# install npm modules for a development system
RUN npm install

# serving dev site on internal port 8080
CMD ["npm", "start"]

########## ########## ##########

##################################################
#                                                #
#        The builder stage for Production        #
#                                                #
##################################################
FROM base as builder

# copy webpack production config
COPY ./webpack.prod.js ./

# copy the source code
COPY ./src ./src

# install npm modules for a production system
#RUN npm ci
RUN npm install

# build for production (ends up in /app/dist)
RUN npm run build

########## ########## ##########

##################################################
#                                                #
#             Final Production Build             #
#                                                #
##################################################
FROM nginx:1.25-bookworm as production

# install the nginx site config file
COPY ./quadclock.conf /etc/nginx/conf.d/default.conf

# set the working directory to the nginx site root
WORKDIR /usr/share/nginx/html

# remove all default nginx files
RUN rm -rf ./*

# copy build files from previous stage
COPY --from=builder /app/dist/* .

# serving content on internal port 8080

# start nginx and serve content
CMD ["nginx", "-g", "daemon off;"]
