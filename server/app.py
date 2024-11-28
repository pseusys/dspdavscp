from os import getenv
from time import time

from connexion import FlaskApp
from connexion.resolver import RelativeResolver

from serv.openapi_server.encoder import JSONEncoder

from src.admin import apply_rules
from src.fixtures import generate_fixtures
import src.db_handler as db

API_DIR = ".."
DEFULT_DEBUG = True
FIXTURES_NUMBER = 10
PORT_NUMBER = 35129
CLEAR_DATABASE = True


# Flask app initialization

app = FlaskApp(__name__, specification_dir=getenv("DSPDAVSCP_API", API_DIR))
app.app.json_provider_class = JSONEncoder


# App settings

apply_rules(app)
app.add_api("DSPDAVSCPAPI.yaml", resolver=RelativeResolver("src.api"), pythonic_params=True, strict_validation=True, resolver_error=501)
db.db_create(bool(getenv("DSPDAVSCP_CLEAR", f"{CLEAR_DATABASE}")))


# Standalone running app

if __name__ == "__main__":
    debug = bool(getenv("DSPDAVSCP_DEBUG", f"{DEFULT_DEBUG}"))
    fixtures = int(getenv("DSPAVSCP_FIXTURES", f"{FIXTURES_NUMBER}"))
    port = int(getenv("DSPDAVSCP_PORT", f"{PORT_NUMBER}"))

    for report in generate_fixtures(fixtures):
        db.dbinsert(report, time())

    app.run(port=port, debug=debug)
