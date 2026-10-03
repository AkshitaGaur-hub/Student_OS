from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "Student Organization System API is running"}
