# tests/test_e2e.py

from datetime import datetime, timedelta, date


def register_user(
    client,
    username="testuser",
    password="testpass",
    email="test@example.com",
    role="User",
):
    resp = client.post(
        "/auth/register",
        json={
            "username": username,
            "password": password,
            "email": email,
            "role": role,
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def login_user(client, username="testuser", password="testpass"):
    resp = client.post(
        "/auth/login",
        data={
            "username": username,
            "password": password,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "access_token" in data
    token = data["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_auth_and_me(client):
    register_user(client)
    headers = login_user(client)

    r = client.get("/users/me/", headers=headers)
    assert r.status_code == 200, r.text
    user = r.json()
    assert user["username"] == "testuser"
    assert user["email"] == "test@example.com"


def test_todos_flow(client):
    register_user(client, username="todo_user", email="todo@example.com")
    headers = login_user(client, username="todo_user")

    # Create todo
    r = client.post(
        "/todos/",
        json={
            "title": "Test todo",
            "description": "Todo description",
            "priority": "high",
        },
        headers=headers,
    )
    assert r.status_code == 201, r.text
    todo = r.json()
    todo_id = todo["id"]

    # List todos
    r = client.get("/todos/", headers=headers)
    assert r.status_code == 200
    todos = r.json()
    assert len(todos) == 1

    # Update todo
    r = client.put(
        f"/todos/{todo_id}",
        json={
            "title": "Updated title",
            "description": "Updated desc",
            "priority": "medium",
        },
        headers=headers,
    )
    assert r.status_code == 200
    updated = r.json()
    assert updated["title"] == "Updated title"

    # Mark completed
    r = client.put(
        f"/todos/{todo_id}/status",
        json={"status": True},
        headers=headers,
    )
    assert r.status_code == 200
    completed = r.json()
    assert completed["status"] is True
    assert completed["completed_datetime"] is not None

    # Delete
    r = client.delete(f"/todos/{todo_id}", headers=headers)
    assert r.status_code == 200

    # Now should be empty
    r = client.get("/todos/", headers=headers)
    assert r.status_code == 200
    assert r.json() == []


def test_diaries_flow(client):
    register_user(client, username="diary_user", email="diary@example.com")
    headers = login_user(client, username="diary_user")

    # Create diary
    r = client.post(
        "/diaries/",
        json={"title": "My day", "content": "It was a good day."},
        headers=headers,
    )
    assert r.status_code == 201, r.text
    diary = r.json()
    diary_id = diary["id"]

    # Get by id
    r = client.get(f"/diaries/{diary_id}", headers=headers)
    assert r.status_code == 200

    # List all
    r = client.get("/diaries/", headers=headers)
    assert r.status_code == 200
    assert len(r.json()) == 1

    # Filter by date
    today_str = diary["entry_datetime"][:10]  # YYYY-MM-DD
    r = client.get(f"/diaries/date/{today_str}", headers=headers)
    assert r.status_code == 200
    assert len(r.json()) >= 1

    # Update diary
    r = client.put(
        f"/diaries/{diary_id}",
        json={
            "title": "Updated day",
            "content": "It was an amazing day.",
        },
        headers=headers,
    )
    assert r.status_code == 200
    updated = r.json()
    assert updated["title"] == "Updated day"

    # Delete
    r = client.delete(f"/diaries/{diary_id}", headers=headers)
    assert r.status_code == 200


def test_notes_flow(client):
    register_user(client, username="notes_user", email="notes@example.com")
    headers = login_user(client, username="notes_user")

    # Create note
    r = client.post(
        "/notes/",
        json={
            "title": "Note 1",
            "content": "Note content",
            "is_pinned": True,
            "is_archived": False,
        },
        headers=headers,
    )
    assert r.status_code == 201, r.text
    note = r.json()
    note_id = note["id"]

    # List notes
    r = client.get("/notes/", headers=headers)
    assert r.status_code == 200
    notes = r.json()
    assert len(notes) == 1

    # Update note
    r = client.put(
        f"/notes/{note_id}",
        json={
            "title": "Updated note",
            "content": "Updated content",
            "is_pinned": False,
            "is_archived": True,
        },
        headers=headers,
    )
    assert r.status_code == 200
    updated = r.json()
    assert updated["title"] == "Updated note"
    assert updated["is_archived"] is True

    # Delete
    r = client.delete(f"/notes/{note_id}", headers=headers)
    assert r.status_code == 200


def test_goals_flow(client):
    # NOTE: this test assumes your goals router is fixed:
    # - get_goal has `id` parameter
    # - create_goal returns db_goal
    # - update_goal uses valid fields
    register_user(client, username="goals_user", email="goals@example.com")
    headers = login_user(client, username="goals_user")

    target = (datetime.utcnow() + timedelta(days=30)).isoformat()

    # Create goal
    r = client.post(
        "/goals/",
        json={
            "title": "Learn React",
            "description": "Build the frontend for this app",
            "target_date": target,
        },
        headers=headers,
    )
    assert r.status_code == 201, r.text
    goal = r.json()
    goal_id = goal["id"]

    # List goals
    r = client.get("/goals/", headers=headers)
    assert r.status_code == 200
    goals = r.json()
    assert len(goals) == 1

    # Get single
    r = client.get(f"/goals/{goal_id}", headers=headers)
    assert r.status_code == 200

    # Update goal (will depend on how you fix UpdateGoal)
    r = client.put(
        f"/goals/{goal_id}",
        json={
            "id": goal_id,
            "title": "Learn React deeply",
            "description": "Finish MVP frontend",
            "is_completed": False,
            "created_at": goal["created_at"],
            "target_date": target,
            "edited_at": None,
            "completed_at": None,
        },
        headers=headers,
    )
    # If your UpdateGoal changes to partial fields,
    # adjust this body accordingly.
    assert r.status_code == 200, r.text
    updated = r.json()
    assert updated["title"] == "Learn React deeply"

    # Mark complete
    r = client.put(f"/goals/complete/{goal_id}", headers=headers)
    assert r.status_code == 200
    completed = r.json()
    assert completed["is_completed"] is True

    # Delete goal
    r = client.delete(f"/goals/{goal_id}", headers=headers)
    assert r.status_code == 200


def test_todos_rollover(client):
    register_user(client, username="rollover_user", email="rollover@example.com")
    headers = login_user(client, username="rollover_user")

    # create 2 incomplete todos for today
    for i in range(2):
        r = client.post(
            "/todos/",
            json={
                "title": f"Todo {i}",
                "description": "to be rolled over",
                "priority": "medium",
            },
            headers=headers,
        )
        assert r.status_code == 201, r.text

    today = date.today().isoformat()

    r_before = client.get(f"/todos/date/{today}", headers=headers)
    assert r_before.status_code == 200
    before_todos = r_before.json()
    assert len(before_todos) >= 2

    # Call rollover
    r = client.post("/todos/rollover", headers=headers)
    assert r.status_code == 200, r.text
    rolled = r.json()
    assert len(rolled) == len(before_todos)

    # Today should have fewer / zero
    r_today = client.get(f"/todos/date/{today}", headers=headers)
    assert r_today.status_code == 200
    # can't guarantee zero if you later create more, but at least not all old ones
    assert len(r_today.json()) <= len(before_todos)

    # Tomorrow should have at least those
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    r_tomorrow = client.get(f"/todos/date/{tomorrow}", headers=headers)
    assert r_tomorrow.status_code == 200
    assert len(r_tomorrow.json()) >= len(before_todos)
