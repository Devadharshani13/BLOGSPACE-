import os
os.environ["DATABASE_URL"] = "sqlite:///./blogspace.db"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_platform():
    print("\n--- 1. Testing Health Endpoint ---")
    res = client.get("/health")
    assert res.status_code == 200
    print("Health check OK:", res.json())

    print("\n--- 2. Testing Categories ---")
    res = client.get("/api/categories")
    assert res.status_code == 200
    cats = res.json()
    assert len(cats) >= 9
    print(f"Categories found: {len(cats)} categories (e.g. {cats[0]['name']})")

    print("\n--- 3. Testing Posts Listing & Pagination ---")
    res = client.get("/api/posts?per_page=5")
    assert res.status_code == 200
    posts = res.json()
    assert posts["total"] >= 10
    print(f"Total posts: {posts['total']}, returned on page 1: {len(posts['items'])}")

    print("\n--- 4. Testing Post by Slug & Reading Time ---")
    slug = posts["items"][0]["slug"]
    res = client.get(f"/api/posts/{slug}")
    assert res.status_code == 200
    post_detail = res.json()
    assert "content" in post_detail
    assert post_detail["reading_time"] >= 1
    print(f"Fetched post '{post_detail['title']}' (views: {post_detail['views']}, reading_time: {post_detail['reading_time']}m)")

    print("\n--- 5. Testing User Login ---")
    login_res = client.post("/api/auth/login", json={"email": "alice@example.com", "password": "Demo@123"})
    assert login_res.status_code == 200
    token_data = login_res.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Logged in as Alice. JWT token generated.")

    print("\n--- 6. Testing /api/auth/me ---")
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    user_info = me_res.json()
    assert user_info["email"] == "alice@example.com"
    print("Current user validated:", user_info["name"])

    print("\n--- 7. Testing Like/Unlike ---")
    post_id = post_detail["id"]
    like_res = client.post(f"/api/posts/{post_id}/like", headers=headers)
    assert like_res.status_code == 200
    print("Like response:", like_res.json())

    print("\n--- 8. Testing Bookmark ---")
    bm_res = client.post(f"/api/posts/{post_id}/bookmark", headers=headers)
    assert bm_res.status_code == 200
    print("Bookmark response:", bm_res.json())

    print("\n--- 9. Testing Comments ---")
    comm_res = client.post(f"/api/posts/{post_id}/comments", json={"content": "Automated verification comment!"}, headers=headers)
    assert comm_res.status_code == 201
    print("Comment posted:", comm_res.json()["content"])

    print("\n--- 10. Testing Create Post ---")
    new_post_res = client.post("/api/posts", json={
        "title": "Automated Test Story in BlogSpace",
        "content": "<p>This is a test article created during the end-to-end verification pipeline.</p>",
        "excerpt": "Verification summary excerpt",
        "category_id": cats[0]["id"],
        "tags": ["testing", "python"],
        "status": "PUBLISHED"
    }, headers=headers)
    assert new_post_res.status_code == 201
    created_post = new_post_res.json()
    print(f"Created post '{created_post['title']}' with slug '{created_post['slug']}'")

    print("\n--- 11. Testing Search ---")
    search_res = client.get("/api/posts?search=FastAPI")
    assert search_res.status_code == 200
    search_data = search_res.json()
    print(f"Search for 'FastAPI' returned {len(search_data['items'])} matching results")

    print("\n--- 12. Testing Admin Login & Admin Stats ---")
    admin_login = client.post("/api/auth/login", json={"email": "admin@blogspace.com", "password": "Admin@123"})
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    stats_res = client.get("/api/admin/stats", headers=admin_headers)
    assert stats_res.status_code == 200
    admin_stats = stats_res.json()
    print("Admin Platform Telemetry Stats:", admin_stats)

    users_res = client.get("/api/admin/users", headers=admin_headers)
    assert users_res.status_code == 200
    print(f"Admin retrieved user list ({users_res.json()['total']} users total)")

    print("\n=======================================================")
    print("   ALL 12 END-TO-END VERIFICATION TESTS PASSED!   ")
    print("=======================================================\n")

if __name__ == "__main__":
    test_full_platform()
