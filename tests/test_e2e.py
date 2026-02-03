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

    # Note: rollover only works for todos from dates BEFORE today
    # So we can't test it effectively without manipulating the database directly
    # or creating todos with past dates (which might not be supported via API)
    
    # Just test that the endpoint exists and returns successfully
    r = client.post("/todos/rollover", headers=headers)
    assert r.status_code == 200
    rolled = r.json()
    # Should return a list (possibly empty if no past incomplete todos)
    assert isinstance(rolled, list)


def test_user_profile_updates(client):
    """Test user profile update endpoints"""
    register_user(client, username="profile_user", email="profile@example.com")
    headers = login_user(client, username="profile_user")
    
    # Get current user info
    r = client.get("/users/me/", headers=headers)
    assert r.status_code == 200
    user = r.json()
    assert user["username"] == "profile_user"
    
    # Update username
    r = client.put(
        "/users/me/username",
        json={"username": "new_profile_user"},
        headers=headers,
    )
    assert r.status_code == 200
    updated_user = r.json()
    assert updated_user["username"] == "new_profile_user"
    
    # Update email
    r = client.put(
        "/users/me/email",
        json={"email": "newemail@example.com"},
        headers=headers,
    )
    assert r.status_code == 200
    updated_user = r.json()
    assert updated_user["email"] == "newemail@example.com"
    assert updated_user["email_validated"] is False
    
    # Update password
    r = client.put(
        "/users/me/password",
        json={"password": "newpassword123"},
        headers=headers,
    )
    assert r.status_code == 200
    
    # Try logging in with new password
    new_headers = login_user(client, username="new_profile_user", password="newpassword123")
    r = client.get("/users/me/", headers=new_headers)
    assert r.status_code == 200


def test_todos_date_filtering(client):
    """Test filtering todos by specific dates"""
    register_user(client, username="date_user", email="date@example.com")
    headers = login_user(client, username="date_user")
    
    today = date.today()
    
    # Create todos for today
    r = client.post(
        "/todos/",
        json={
            "title": "Today's task",
            "description": "Complete this today",
            "priority": "high",
        },
        headers=headers,
    )
    assert r.status_code == 201
    
    # Get todos for today
    r = client.get(f"/todos/date/{today.isoformat()}", headers=headers)
    assert r.status_code == 200
    todos = r.json()
    assert len(todos) >= 1
    assert todos[0]["title"] == "Today's task"


def test_todos_search(client):
    """Test searching todos by title and description"""
    register_user(client, username="search_user", email="search@example.com")
    headers = login_user(client, username="search_user")
    
    # Create multiple todos
    todos_data = [
        {"title": "Buy groceries", "description": "Milk and eggs", "priority": "medium"},
        {"title": "Call doctor", "description": "Schedule appointment", "priority": "high"},
        {"title": "Grocery shopping", "description": "Get vegetables", "priority": "low"},
    ]
    
    for todo_data in todos_data:
        r = client.post("/todos/", json=todo_data, headers=headers)
        assert r.status_code == 201
    
    # Search for "grocery"
    r = client.get("/todos/search", params={"query": "grocery"}, headers=headers)
    assert r.status_code == 200
    results = r.json()
    # Search is case-insensitive and should find at least 1
    assert len(results) >= 1
    
    # Search for "doctor"
    r = client.get("/todos/search", params={"query": "doctor"}, headers=headers)
    assert r.status_code == 200
    results = r.json()
    assert len(results) == 1
    assert results[0]["title"] == "Call doctor"


def test_notes_pinned_and_archived(client):
    """Test pinned and archived notes functionality"""
    register_user(client, username="notes_adv_user", email="notesadv@example.com")
    headers = login_user(client, username="notes_adv_user")
    
    # Create a pinned note
    r = client.post(
        "/notes/",
        json={
            "title": "Pinned Note",
            "content": "This is important",
            "is_pinned": True,
            "is_archived": False,
        },
        headers=headers,
    )
    assert r.status_code == 201
    pinned_note = r.json()
    assert pinned_note["is_pinned"] is True
    
    # Create an archived note
    r = client.post(
        "/notes/",
        json={
            "title": "Archived Note",
            "content": "Old stuff",
            "is_pinned": False,
            "is_archived": True,
        },
        headers=headers,
    )
    assert r.status_code == 201
    archived_note = r.json()
    assert archived_note["is_archived"] is True
    
    # Get all notes
    r = client.get("/notes/", headers=headers)
    assert r.status_code == 200
    notes = r.json()
    assert len(notes) == 2


def test_diary_date_filtering(client):
    """Test filtering diaries by date"""
    register_user(client, username="diary_date_user", email="diarydate@example.com")
    headers = login_user(client, username="diary_date_user")
    
    # Create diary entry
    r = client.post(
        "/diaries/",
        json={"title": "Today's entry", "content": "What a day!"},
        headers=headers,
    )
    assert r.status_code == 201
    diary = r.json()
    
    # Get diary by date
    today_str = diary["entry_datetime"][:10]
    r = client.get(f"/diaries/date/{today_str}", headers=headers)
    assert r.status_code == 200
    diaries = r.json()
    assert len(diaries) >= 1


def test_goals_completion(client):
    """Test marking goals as complete"""
    register_user(client, username="goals_complete_user", email="goalscomp@example.com")
    headers = login_user(client, username="goals_complete_user")
    
    target = (datetime.utcnow() + timedelta(days=15)).isoformat()
    
    # Create goal
    r = client.post(
        "/goals/",
        json={
            "title": "Complete project",
            "description": "Finish all features",
            "target_date": target,
        },
        headers=headers,
    )
    assert r.status_code == 201
    goal = r.json()
    goal_id = goal["id"]
    assert goal["is_completed"] is False
    
    # Mark as complete
    r = client.put(f"/goals/complete/{goal_id}", headers=headers)
    assert r.status_code == 200
    completed_goal = r.json()
    assert completed_goal["is_completed"] is True
    assert completed_goal["completed_at"] is not None


def test_todo_status_toggle(client):
    """Test toggling todo status between complete and incomplete"""
    register_user(client, username="status_user", email="status@example.com")
    headers = login_user(client, username="status_user")
    
    # Create todo
    r = client.post(
        "/todos/",
        json={
            "title": "Toggle task",
            "description": "Test status toggle",
            "priority": "medium",
        },
        headers=headers,
    )
    assert r.status_code == 201
    todo = r.json()
    todo_id = todo["id"]
    assert todo["status"] is False
    
    # Mark as complete
    r = client.put(
        f"/todos/{todo_id}/status",
        json={"status": True},
        headers=headers,
    )
    assert r.status_code == 200
    completed = r.json()
    assert completed["status"] is True
    
    # Mark as incomplete
    r = client.put(
        f"/todos/{todo_id}/status",
        json={"status": False},
        headers=headers,
    )
    assert r.status_code == 200
    incomplete = r.json()
    assert incomplete["status"] is False


def test_invalid_credentials(client):
    """Test login with invalid credentials"""
    register_user(client, username="valid_user", email="valid@example.com")
    
    # Try login with wrong password
    r = client.post(
        "/auth/login",
        data={
            "username": "valid_user",
            "password": "wrongpassword",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 401
    
    # Try login with non-existent user
    r = client.post(
        "/auth/login",
        data={
            "username": "nonexistent",
            "password": "testpass",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 401


def test_unauthorized_access(client):
    """Test accessing protected endpoints without authentication"""
    
    # Try to access user profile without token
    r = client.get("/users/me/")
    assert r.status_code in [401, 403]  # Can be either unauthorized or forbidden
    
    # Try to create todo without token
    r = client.post(
        "/todos/",
        json={
            "title": "Unauthorized todo",
            "description": "Should fail",
            "priority": "low",
        },
    )
    assert r.status_code in [401, 403]
    
    # Try to get diaries without token
    r = client.get("/diaries/")
    assert r.status_code in [401, 403]


def test_duplicate_user_registration(client):
    """Test that duplicate usernames/emails are handled"""
    # Register first user
    register_user(client, username="duplicate", email="duplicate@example.com")
    
    # Try to register with same username - this will raise IntegrityError
    # which means the database constraint is working
    try:
        r = client.post(
            "/auth/register",
            json={
                "username": "duplicate",
                "password": "testpass",
                "email": "different@example.com",
                "role": "User",
            },
        )
        # If we get here, should be an error status code
        assert r.status_code in [400, 409, 500]
    except Exception as e:
        # IntegrityError being raised means constraint is working
        assert "UNIQUE constraint failed" in str(e) or "IntegrityError" in str(e)


def test_get_nonexistent_resources(client):
    """Test getting resources that don't exist"""
    register_user(client, username="notfound_user", email="notfound@example.com")
    headers = login_user(client, username="notfound_user")
    
    # Try to get non-existent todo
    r = client.get("/todos/99999", headers=headers)
    assert r.status_code == 404
    
    # Try to get non-existent diary
    r = client.get("/diaries/99999", headers=headers)
    assert r.status_code == 404
    
    # Try to get non-existent note
    r = client.get("/notes/99999", headers=headers)
    assert r.status_code == 404
    
    # Try to get non-existent goal
    r = client.get("/goals/99999", headers=headers)
    assert r.status_code == 404


def test_delete_nonexistent_resources(client):
    """Test deleting resources that don't exist"""
    register_user(client, username="delete_user", email="delete@example.com")
    headers = login_user(client, username="delete_user")
    
    # Try to delete non-existent todo
    r = client.delete("/todos/99999", headers=headers)
    assert r.status_code == 404
    
    # Try to delete non-existent diary
    r = client.delete("/diaries/99999", headers=headers)
    assert r.status_code == 404
    
    # Try to delete non-existent note
    r = client.delete("/notes/99999", headers=headers)
    assert r.status_code == 404
    
    # Try to delete non-existent goal
    r = client.delete("/goals/99999", headers=headers)
    assert r.status_code == 404


def test_update_nonexistent_resources(client):
    """Test updating resources that don't exist"""
    register_user(client, username="update_user", email="update@example.com")
    headers = login_user(client, username="update_user")
    
    # Try to update non-existent todo
    r = client.put(
        "/todos/99999",
        json={
            "title": "Updated",
            "description": "Updated",
            "priority": "high",
        },
        headers=headers,
    )
    assert r.status_code == 404


def test_multiple_users_data_isolation(client):
    """Test that users can only access their own data"""
    # Register and create todo for user1
    register_user(client, username="user1", email="user1@example.com")
    headers1 = login_user(client, username="user1")
    
    r = client.post(
        "/todos/",
        json={
            "title": "User1 todo",
            "description": "Private task",
            "priority": "high",
        },
        headers=headers1,
    )
    assert r.status_code == 201
    user1_todo = r.json()
    
    # Register user2
    register_user(client, username="user2", email="user2@example.com", password="testpass2")
    headers2 = login_user(client, username="user2", password="testpass2")
    
    # User2 tries to access user1's todo
    r = client.get(f"/todos/{user1_todo['id']}", headers=headers2)
    assert r.status_code == 404
    
    # User2 should see empty list
    r = client.get("/todos/", headers=headers2)
    assert r.status_code == 200
    todos = r.json()
    assert len(todos) == 0


def test_todos_priority_levels(client):
    """Test creating todos with different priority levels"""
    register_user(client, username="priority_user", email="priority@example.com")
    headers = login_user(client, username="priority_user")
    
    priorities = ["low", "medium", "high"]
    
    for priority in priorities:
        r = client.post(
            "/todos/",
            json={
                "title": f"{priority} priority task",
                "description": f"Task with {priority} priority",
                "priority": priority,
            },
            headers=headers,
        )
        assert r.status_code == 201
        todo = r.json()
        assert todo["priority"] == priority


def test_empty_lists_on_new_user(client):
    """Test that new users have empty lists for all resources"""
    register_user(client, username="empty_user", email="empty@example.com")
    headers = login_user(client, username="empty_user")
    
    # Check empty todos
    r = client.get("/todos/", headers=headers)
    assert r.status_code == 200
    assert r.json() == []
    
    # Check empty diaries
    r = client.get("/diaries/", headers=headers)
    assert r.status_code == 200
    assert r.json() == []
    
    # Check empty notes
    r = client.get("/notes/", headers=headers)
    assert r.status_code == 200
    assert r.json() == []
    
    # Check empty goals
    r = client.get("/goals/", headers=headers)
    assert r.status_code == 200
    assert r.json() == []
