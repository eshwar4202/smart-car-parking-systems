from flask import Flask, request
from supabase import create_client, Client

url = "https://velagnrotxuqhiczsczz.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw"
supabase: Client = create_client(url, key)
app = Flask(__name__)


@app.route("/")
def fetch():
    key_value = request.args.get(
        "status"
    )  # Extract "key" from the URL query parameters
    response = (
        supabase.table("sensor").update({"status": key_value}).eq("id", 1).execute()
    )

    return str(response)


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
