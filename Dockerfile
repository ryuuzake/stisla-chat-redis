FROM python:3.8-slim

WORKDIR /code

COPY requirements.txt requirements.txt

RUN pip install -U setuptools pip

# docker overwrites the src location for editable packages so we pass in a --src path that doesnt get blatted
# https://stackoverflow.com/questions/29905909/pip-install-e-packages-dont-appear-in-docker
RUN pip install -r requirements.txt --src /usr/local/src

COPY . .

CMD ["uvicorn", "chat:app", "--host", "0.0.0.0", "--port", "9080"]
