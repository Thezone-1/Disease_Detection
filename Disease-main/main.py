import subprocess
from subprocess import CalledProcessError
from typing import List
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Request(BaseModel):
    symptoms: List[str]


def find_diseases(symptoms: List[str]) -> List[str]:
    matching_diseases: list[str] = []
    symptoms_string = ", ".join([f"{symptom}(X)" for symptom in symptoms])

    with open("query.pl", "w") as query_file:
        print(
            f"?- findall(X, ({symptoms_string}), Diseases), print(Diseases), nl.\n?- halt.",
            file=query_file,
        )

    prolog_cmd: list[str] = [
        "swipl",
        "knowledge_base.pl",
        "query.pl",
    ]

    try:
        returned_output: bytes = subprocess.check_output(prolog_cmd)
        returned_string = returned_output.decode("utf-8").strip()
        returned_string = returned_string[1:-1]
        if len(returned_string) != 0:
            matching_diseases = [
                disease.strip() for disease in returned_string.split(",")
            ]
    except CalledProcessError as e:
        print(f"CalledProcessError :: {e.cmd}")
    except FileNotFoundError as e:
        print(e)

    return matching_diseases


@app.post("/find-diseases")
def get_diseases(req: Request):
    diseases = find_diseases(req.symptoms)
    return {"diseases": diseases}
