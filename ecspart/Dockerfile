FROM alpine
LABEL MAINTAINER="Neil Kuan"
LABEL NAME="python3-mockdata-api"
LABEL Version="v1.7.3"
ENV BUILD_DEPS="python3-dev build-base linux-headers py3-pip"
ENV TZ=Asia/Taipei
ENV URL='0.0.0.0'
ENV TEST_OUTDIR='/app'
WORKDIR /app
COPY app.py app.py
COPY requirements.txt requirements.txt
RUN  apk add --no-cache $BUILD_DEPS python3 \
    && python3 -m ensurepip \
    && pip3 install -r requirements.txt --no-cache-dir \
    && apk del $BUILD_DEPS

EXPOSE 8080
CMD ["python3", "app.py"]