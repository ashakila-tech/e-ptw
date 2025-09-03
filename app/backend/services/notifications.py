import json, time, requests, jwt
from ..config import settings

def _jwt_for_fcm():
    iat = int(time.time())
    payload = {
        "iss": settings.FCM_SA_EMAIL,
        "scope": "https://www.googleapis.com/auth/firebase.messaging",
        "aud": "https://oauth2.googleapis.com/token",
        "iat": iat, "exp": iat + 3600,
    }
    token = jwt.encode(payload, settings.FCM_SA_PRIVATE_KEY, algorithm="RS256")
    resp = requests.post("https://oauth2.googleapis.com/token", data={
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": token
    })
    resp.raise_for_status()
    return resp.json()["access_token"]

def send_push(device_token: str, title: str, body: str, data: dict | None = None):
    if not settings.FCM_PROJECT_ID:
        return {"skipped": True, "reason": "FCM not configured"}
    access_token = _jwt_for_fcm()
    url = f"https://fcm.googleapis.com/v1/projects/{settings.FCM_PROJECT_ID}/messages:send"
    payload = {"message": {"token": device_token, "notification": {"title": title, "body": body}, "data": data or {}}}
    r = requests.post(url, headers={"Authorization": f"Bearer {access_token}"}, json=payload)
    r.raise_for_status()
    return r.json()
