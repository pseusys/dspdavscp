FROM openapitools/openapi-generator-cli AS generator

WORKDIR /local

COPY DSPDAVSCPAPI.yaml ./
RUN docker-entrypoint.sh generate -i DSPDAVSCPAPI.yaml -g python-flask -o serv



FROM python:3.13-alpine AS build

WORKDIR /dspdavscp/server

RUN pip3 install --upgrade --no-cache-dir poetry && poetry self add poetry-plugin-export poethepoet

COPY server/pyproject.toml ./
RUN poetry export -f requirements.txt --output requirements.txt
RUN poetry install --no-plugins --with dev



FROM build AS debug

ENV DSPDAVSCP_API=.

COPY --from=generator /local/serv ./serv
RUN poetry poe install-cli

COPY server DSPDAVSCPAPI.yaml ./

ENTRYPOINT poetry poe run



FROM python:3.13-alpine AS deploy

WORKDIR /dspdavscp/server
ENV DSPDAVSCP_API=.

RUN pip3 install gunicorn

COPY --from=build /dspdavscp/server/requirements.txt ./
RUN pip3 install -r requirements.txt

COPY --from=generator /local/serv ./serv
RUN pip3 install ./serv

COPY server DSPDAVSCPAPI.yaml ./

ENTRYPOINT gunicorn --bind localhost:${DSPDAVSCP_PORT} app:app
