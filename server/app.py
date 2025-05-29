from flask import Flask, jsonify, request, g
from flask_cors import CORS
import sqlite3
import os
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import jwt
import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "supports_credentials": True}})

# Configuration
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['DATABASE'] = 'instance/taskboard.db'

# Database setup
def get_db():
    """Hàm lấy kết nối database, tạo mới nếu chưa tồn tại"""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(app.config['DATABASE'])
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    """Đóng kết nối database khi request kết thúc"""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    """Khởi tạo database với schema từ file schema.sql"""
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

# Token validation decorator
def token_required(f):
    """Decorator để xác thực JWT token cho các API yêu cầu đăng nhập"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else None
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            db = get_db()
            user = db.execute('SELECT * FROM users WHERE id = ?', (data['id'],)).fetchone()
            
            if not user:
                return jsonify({'message': 'User not found!'}), 401
                
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
            
        return f(user, *args, **kwargs)
    
    return decorated

# User authentication routes
@app.route('/api/user/signup', methods=['POST'])
def signup():
    """API đăng ký tài khoản mới"""
    data = request.get_json()
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'message': 'Missing required fields!'}), 400
    
    hashed_password = generate_password_hash(password)
    
    db = get_db()
    
    try:
        cursor = db.cursor()
        cursor.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
                      (username, email, hashed_password))
        db.commit()
        
        return jsonify({'message': 'User created successfully!'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'message': 'User with this email already exists!'}), 409

@app.route('/api/user/login', methods=['POST'])
def login():
    """API đăng nhập và trả về JWT token"""
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'message': 'Missing required fields!'}), 400
    
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid credentials!'}), 401
    
    # Xác nhận id người dùng
    user_dict = dict(user)
    print(f"User found: {user_dict}")
    
    # Kiểm tra nếu id là None thì phải cập nhật
    if user_dict['id'] is None:
        print("Warning: Found user with null ID. Database schema may be incorrect.")
    
    token = jwt.encode({
        'id': user_dict['id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({
        'token': token,
        'user': {
            'id': user_dict['id'],
            'username': user_dict['username'],
            'email': user_dict['email']
        }
    }), 200

# Board routes
@app.route('/api/boards', methods=['GET'])
@token_required
def get_all_boards(current_user):
    """API lấy tất cả boards của người dùng"""
    db = get_db()
    boards = db.execute(
        'SELECT id, name, description, created_at FROM boards WHERE user_id = ? ORDER BY created_at DESC', 
        (current_user['id'],)
    ).fetchall()
    
    board_list = []
    for board in boards:
        board_list.append({
            'id': board['id'],
            'name': board['name'],
            'description': board['description'],
            'created_at': board['created_at']
        })
    
    return jsonify({'boards': board_list}), 200

@app.route('/api/boards', methods=['POST'])
@token_required
def create_board(current_user):
    """API tạo board mới"""
    data = request.get_json()
    
    name = data.get('name')
    description = data.get('description', '')
    
    if not name:
        return jsonify({'message': 'Board name is required!'}), 400
    
    db = get_db()
    
    try:
        cursor = db.cursor()
        cursor.execute(
            'INSERT INTO boards (name, description, user_id, created_at) VALUES (?, ?, ?, datetime("now"))', 
            (name, description, current_user['id'])
        )
        db.commit()
        
        board_id = cursor.lastrowid
        
        return jsonify({
            'message': 'Board created successfully!',
            'board_id': board_id
        }), 201
    except Exception as e:
        return jsonify({'message': 'Failed to create board!', 'error': str(e)}), 500

@app.route('/api/boards/<board_id>', methods=['GET'])
@token_required
def get_board(current_user, board_id):
    """API lấy thông tin chi tiết của một board và các tasks của nó"""
    db = get_db()
    
    # Get board
    board = db.execute(
        'SELECT id, name, description, created_at FROM boards WHERE id = ? AND user_id = ?', 
        (board_id, current_user['id'])
    ).fetchone()
    
    if not board:
        return jsonify({'message': 'Board not found!'}), 404
    
    # Get tasks for the board
    tasks = db.execute(
        'SELECT id, name, description, status, icon FROM tasks WHERE board_id = ? ORDER BY id DESC', 
        (board_id,)
    ).fetchall()
    
    task_list = []
    for task in tasks:
        task_list.append({
            'id': task['id'],
            'name': task['name'],
            'description': task['description'],
            'status': task['status'],
            'icon': task['icon']
        })
    
    board_data = {
        'id': board['id'],
        'name': board['name'],
        'description': board['description'],
        'created_at': board['created_at']
    }
    
    return jsonify({'board': board_data, 'tasks': task_list}), 200

@app.route('/api/boards/<board_id>', methods=['PUT'])
@token_required
def update_board(current_user, board_id):
    """API cập nhật thông tin của một board"""
    data = request.get_json()
    
    name = data.get('name')
    description = data.get('description', '')
    
    if not name:
        return jsonify({'message': 'Board name is required!'}), 400
    
    db = get_db()
    
    # Check if board exists and belongs to the user
    board = db.execute(
        'SELECT id FROM boards WHERE id = ? AND user_id = ?', 
        (board_id, current_user['id'])
    ).fetchone()
    
    if not board:
        return jsonify({'message': 'Board not found!'}), 404
    
    # Update board
    db.execute(
        'UPDATE boards SET name = ?, description = ? WHERE id = ?', 
        (name, description, board_id)
    )
    db.commit()
    
    return jsonify({'message': 'Board updated successfully!'}), 200

@app.route('/api/boards/<board_id>', methods=['DELETE'])
@token_required
def delete_board(current_user, board_id):
    """API xóa một board và tất cả tasks của nó"""
    db = get_db()
    
    # Check if board exists and belongs to the user
    board = db.execute(
        'SELECT id FROM boards WHERE id = ? AND user_id = ?', 
        (board_id, current_user['id'])
    ).fetchone()
    
    if not board:
        return jsonify({'message': 'Board not found!'}), 404
    
    # Delete board and all its tasks
    cursor = db.cursor()
    cursor.execute('DELETE FROM tasks WHERE board_id = ?', (board_id,))
    cursor.execute('DELETE FROM boards WHERE id = ?', (board_id,))
    db.commit()
    
    return jsonify({'message': 'Board deleted successfully!'}), 200

# Task routes
@app.route('/api/tasks', methods=['POST'])
@token_required
def create_task(current_user):
    """API tạo task mới"""
    data = request.get_json()
    
    name = data.get('name')
    description = data.get('description', '')
    status = data.get('status', 'In Progress')
    icon = data.get('icon', '')
    board_id = data.get('board_id')
    
    if not name or not board_id:
        return jsonify({'message': 'Task name and board ID are required!'}), 400
    
    db = get_db()
    
    # Check if board exists and belongs to the user
    board = db.execute(
        'SELECT id FROM boards WHERE id = ? AND user_id = ?', 
        (board_id, current_user['id'])
    ).fetchone()
    
    if not board:
        return jsonify({'message': 'Board not found!'}), 404
    
    cursor = db.cursor()
    cursor.execute(
        'INSERT INTO tasks (name, description, status, icon, board_id) VALUES (?, ?, ?, ?, ?)', 
        (name, description, status, icon, board_id)
    )
    db.commit()
    
    task_id = cursor.lastrowid
    
    return jsonify({'message': 'Task created successfully!', 'task_id': task_id}), 201

@app.route('/api/tasks/<task_id>', methods=['PUT'])
@token_required
def update_task(current_user, task_id):
    """API cập nhật thông tin của một task"""
    data = request.get_json()
    
    db = get_db()
    
    # Get the task
    task = db.execute('SELECT t.id, t.board_id FROM tasks t JOIN boards b ON t.board_id = b.id WHERE t.id = ? AND b.user_id = ?', 
                     (task_id, current_user['id'])).fetchone()
    
    if not task:
        return jsonify({'message': 'Task not found!'}), 404
    
    # Extract fields from request
    name = data.get('name')
    description = data.get('description')
    status = data.get('status')
    icon = data.get('icon')
    
    # Build update query
    query = 'UPDATE tasks SET '
    params = []
    
    if name:
        query += 'name = ?, '
        params.append(name)
    
    if description is not None:
        query += 'description = ?, '
        params.append(description)
    
    if status:
        query += 'status = ?, '
        params.append(status)
    
    if icon is not None:
        query += 'icon = ?, '
        params.append(icon)
    
    # Remove trailing comma and space
    query = query.rstrip(', ')
    
    # Add WHERE clause
    query += ' WHERE id = ?'
    params.append(task_id)
    
    # Execute update
    db.execute(query, params)
    db.commit()
    
    return jsonify({'message': 'Task updated successfully!'}), 200

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
@token_required
def delete_task(current_user, task_id):
    """API xóa một task"""
    db = get_db()
    
    # Check if task exists and belongs to the user
    task = db.execute('SELECT t.id FROM tasks t JOIN boards b ON t.board_id = b.id WHERE t.id = ? AND b.user_id = ?', 
                     (task_id, current_user['id'])).fetchone()
    
    if not task:
        return jsonify({'message': 'Task not found!'}), 404
    
    # Delete task
    db.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    db.commit()
    
    return jsonify({'message': 'Task deleted successfully!'}), 200

# Initialize database if it doesn't exist
@app.before_first_request
def initialize_database():
    """Khởi tạo database khi ứng dụng khởi động và có request đầu tiên"""
    import os
    
    # Xóa database cũ nếu tồn tại
    if os.path.exists(app.config['DATABASE']):
        os.remove(app.config['DATABASE'])
        print(f"Removed old database at {app.config['DATABASE']}")
    
    # Ensure the instance directory exists
    os.makedirs(os.path.dirname(app.config['DATABASE']), exist_ok=True)
    
    # Khởi tạo database mới
    init_db()
    print("Database initialized with schema")
    
    # Tạo tài khoản test
    with app.app_context():
        db = get_db()
        hashed_password = generate_password_hash('password123')
        db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
                  ('test', 'test@example.com', hashed_password))
        db.commit()
        
        # Kiểm tra tài khoản đã được tạo
        user = db.execute('SELECT * FROM users WHERE email = ?', ('test@example.com',)).fetchone()
        print(f"Created test account: test@example.com / password123. User ID: {user['id']}")

if __name__ == '__main__':
    # Chạy ứng dụng với host 0.0.0.0 để có thể truy cập từ bên ngoài container
    # Port 5000 là port bên trong container, được map sang port khác trong docker-compose
    app.run(host='0.0.0.0', port=5000, debug=True) 