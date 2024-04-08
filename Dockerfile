# Stage 1: Build the Angular app
FROM node:18.13.0 as build

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @angular/cli

RUN npm install chart.js xlsx

COPY . .

RUN ng build --configuration=production --output-path=dist/aftas-angular

# Stage 2: Serve the Angular app with Nginx
FROM nginx:latest

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration that redirects all requests to Angular app
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built Angular app from the build stage to the nginx server
COPY --from=build /app/dist/aftas-angular /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80