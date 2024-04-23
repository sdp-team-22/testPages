FROM python:3.12-slim

WORKDIR /flask
COPY . .

RUN pip3 install --no-cache-dir -r requirements.txt

EXPOSE 5000

ENV FLASK_APP=app.py

CMD [ "flask", "run" , "--host", "0.0.0.0", "--port", "5000", "--no-debugger"]


# Dev Instructions
# (A) Download 'Dev Container' & 'Docker' extention in VSC
# (B) Navigate terminal to ../flask directory
# (C) docker build -t flask-dev-image -f Dockerfile .
# (D) docker run --name flask-dev -p 5000:5000 -d -v "$(pwd)":/code -it flask-dev-image
# (E) Bottom corner of VSC (looks like ><) click on it and press 'attach to running container'
# (F) Might need to select '/code' for your root location
# (G) http://localhost:80
# (H) docker kill backend-dev