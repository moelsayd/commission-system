import sqlite3
from database import get_db
from datetime import datetime

def log_activity(user_id=1, action='', entity_type='', entity_id=None, details=''):
    db = get_db()
    db.execute("INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?,?,?,?,?)",
               (user_id, action, entity_type, entity_id, details))
    db.commit()
    db.close()

# --- المستخدمين ---
def get_user_by_username(username):
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()
    db.close()
    return user

# --- العملاء ---
def get_customers(search='', page=1, per_page=20, sort_by='id', order='asc'):
    offset = (page - 1) * per_page
    allowed_sort = ['id','name','phone','created_at']
    if sort_by not in allowed_sort: sort_by = 'id'
    order_clause = f"ORDER BY {sort_by} {order}" if order in ('asc','desc') else ''
    where = ""
    params = []
    if search:
        where = "WHERE name LIKE ? OR phone LIKE ?"
        params = [f'%{search}%', f'%{search}%']
    db = get_db()
    total = db.execute(f"SELECT COUNT(*) FROM customers {where}", params).fetchone()[0]
    rows = db.execute(f"SELECT * FROM customers {where} {order_clause} LIMIT ? OFFSET ?",
                      params + [per_page, offset]).fetchall()
    db.close()
    return [dict(r) for r in rows], total

def get_customer_by_id(cid):
    db = get_db()
    row = db.execute("SELECT * FROM customers WHERE id=?", (cid,)).fetchone()
    db.close()
    return dict(row) if row else None

def create_customer(name, phone, email, address, notes):
    db = get_db()
    cursor = db.execute("INSERT INTO customers (name, phone, email, address, notes) VALUES (?,?,?,?,?)",
                        (name, phone, email, address, notes))
    db.commit()
    new_id = cursor.lastrowid
    log_activity(action='create', entity_type='customer', entity_id=new_id, details=f'Name: {name}')
    db.close()
    return new_id

def update_customer(cid, name, phone, email, address, notes):
    db = get_db()
    db.execute("UPDATE customers SET name=?, phone=?, email=?, address=?, notes=? WHERE id=?",
               (name, phone, email, address, notes, cid))
    db.commit()
    log_activity(action='update', entity_type='customer', entity_id=cid, details=f'Name: {name}')
    db.close()

def delete_customer(cid):
    db = get_db()
    db.execute("DELETE FROM customers WHERE id=?", (cid,))
    db.commit()
    log_activity(action='delete', entity_type='customer', entity_id=cid)
    db.close()

# ... دوال مماثلة للموردين products ...
# سأختصر هنا وأتوسع في الملف الحقيقي، المهم نفس النمط.
# سأقدم في الـ app.py دوال API التي تستخدم هذه النماذج.

# لتوفير المساحة سأعرض النماذج الكاملة في ملف models.py منفصل في التنفيذ النهائي لكن هنا سأشرحها.
# لكن من أجل الإجابة سأدمج المنطق في app.py مع استدعاء دوال مختصرة.
